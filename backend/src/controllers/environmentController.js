const { exec, spawn } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const pool = require('../config/db');
const fs = require('fs');

// Environment Create
const createEnvironment = async (req, res) => {
  try {
    const { name } = req.body;
    const user = req.user;

    // Namespace name generate karo
    const namespace = `${user.email.split('@')[0]}-${name}`.toLowerCase();

    // Check if already exists
    const exists = await pool.query(
      'SELECT * FROM environments WHERE namespace = $1',
      [namespace]
    );

    if (exists.rows.length > 0) {
      return res.status(400).json({
        message: 'Environment already exists'
      });
    }

    // Random port assign karo
    const port = Math.floor(Math.random() * (9000 - 8081) + 8081);
    const url = `http://localhost:${port}`;

    // Kubernetes namespace create karo
    await execPromise(`kubectl create namespace ${namespace} --dry-run=client -o yaml | kubectl apply -f -`);

    // Helm se deploy karo — install ya upgrade
    const helmPath = 'D:/DevOps/Dyanamic env. project/helm/dev-environment';
    await execPromise(`helm upgrade --install ${namespace} "${helmPath}" --set namespace=${namespace} --set ingress.host=${namespace}.local --namespace ${namespace}`);

    // Custom HTML page banao
    const htmlTemplate = fs.readFileSync(
      'D:/DevOps/Dyanamic env. project/app/templates/env-page.html',
      'utf8'
    );

    const customHtml = htmlTemplate
      .replace(/{{ENV_NAME}}/g, name)
      .replace(/{{USER_NAME}}/g, user.email.split('@')[0])
      .replace(/{{NAMESPACE}}/g, namespace)
      .replace(/{{ENV_URL}}/g, url)
      .replace(/{{CREATED_AT}}/g, new Date().toLocaleDateString());

    // ConfigMap banao
    const configMapYaml = `apiVersion: v1
kind: ConfigMap
metadata:
  name: ${namespace}-html
  namespace: ${namespace}
data:
  index.html: |
${customHtml.split('\n').map(line => '    ' + line).join('\n')}
`;

    const tmpFile = `D:/DevOps/Dyanamic env. project/app/templates/${namespace}-configmap.yaml`;
    fs.writeFileSync(tmpFile, configMapYaml);
    await execPromise(`kubectl apply -f "${tmpFile}"`);
    fs.unlinkSync(tmpFile);

    // Database mein save karo
    const newEnv = await pool.query(
      'INSERT INTO environments (user_id, name, namespace, url, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [user.id, name, namespace, url, 'running']
    );

    // Port-forward automatically start karo
    const portForward = spawn('kubectl', [
      'port-forward',
      `service/${namespace}-service`,
      `${port}:80`,
      '-n', namespace
    ], {
      detached: true,
      stdio: 'ignore'
    });
    portForward.unref();

    res.status(201).json({
      message: '✅ Environment created successfully!',
      environment: newEnv.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Environment List
const getEnvironments = async (req, res) => {
  try {
    const user = req.user;

    const envs = await pool.query(
      'SELECT * FROM environments WHERE user_id = $1',
      [user.id]
    );

    res.json({
      environments: envs.rows
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Environment Delete
const deleteEnvironment = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    // Environment check karo
    const env = await pool.query(
      'SELECT * FROM environments WHERE id = $1 AND user_id = $2',
      [id, user.id]
    );

    if (env.rows.length === 0) {
      return res.status(404).json({
        message: 'Environment not found'
      });
    }

    // Helm release delete karo
    await execPromise(
      `helm uninstall ${env.rows[0].namespace} --namespace ${env.rows[0].namespace}`
    ).catch(() => {});

    // Kubernetes namespace delete karo
    await execPromise(
      `kubectl delete namespace ${env.rows[0].namespace} --ignore-not-found`
    );

    // Database se delete karo
    await pool.query(
      'DELETE FROM environments WHERE id = $1',
      [id]
    );

    res.json({
      message: '✅ Environment deleted successfully!'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Environment Status
const getEnvironmentStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const env = await pool.query(
      'SELECT * FROM environments WHERE id = $1',
      [id]
    );

    if (env.rows.length === 0) {
      return res.status(404).json({
        message: 'Environment not found'
      });
    }

    // Kubernetes se live status lo
    const { stdout } = await execPromise(
      `kubectl get pods -n ${env.rows[0].namespace} --no-headers 2>/dev/null || echo "No pods"`
    );

    res.json({
      environment: env.rows[0],
      pods: stdout.trim()
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Logs API
const getEnvironmentLogs = async (req, res) => {
  try {
    const { id } = req.params;

    const env = await pool.query(
      'SELECT * FROM environments WHERE id = $1',
      [id]
    );

    if (env.rows.length === 0) {
      return res.status(404).json({ message: 'Environment not found' });
    }

    const { stdout } = await execPromise(
      `kubectl logs -l app=${env.rows[0].namespace} -n ${env.rows[0].namespace} --tail=50 2>/dev/null || echo "No logs available"`
    );

    res.json({
      namespace: env.rows[0].namespace,
      logs: stdout.trim()
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
// Deploy App — Docker image deploy karo
const deployApp = async (req, res) => {
  try {
    const { id } = req.params;
    const { image } = req.body;
    const user = req.user;

    // Environment check karo
    const env = await pool.query(
      'SELECT * FROM environments WHERE id = $1 AND user_id = $2',
      [id, user.id]
    );

    if (env.rows.length === 0) {
      return res.status(404).json({
        message: 'Environment not found'
      });
    }

    const namespace = env.rows[0].namespace;

    // Helm upgrade karo naye image ke saath
    const helmPath = 'D:/DevOps/Dyanamic env. project/helm/dev-environment';
    await execPromise(`helm upgrade ${namespace} "${helmPath}" \
      --set namespace=${namespace} \
      --set ingress.host=${namespace}.local \
      --set image.repository=${image.split(':')[0]} \
      --set image.tag=${image.split(':')[1] || 'latest'} \
      --namespace ${namespace}`);

    // Database update karo
    await pool.query(
      'UPDATE environments SET status = $1 WHERE id = $2',
      ['running', id]
    );

    res.json({
      message: `✅ App deployed successfully with image: ${image}`,
      environment: env.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { 
  createEnvironment, 
  getEnvironments, 
  deleteEnvironment,
  getEnvironmentStatus,
  getEnvironmentLogs,
  deployApp
};
