const pool = require('../config/db');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

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

    // Kubernetes namespace create karo
    await execPromise(`kubectl create namespace ${namespace} --dry-run=client -o yaml | kubectl apply -f -`);

    // Database mein save karo
    const newEnv = await pool.query(
      'INSERT INTO environments (user_id, name, namespace, url, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [user.id, name, namespace, `http://${namespace}.local`, 'running']
    );

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

    // Kubernetes namespace delete karo
    await execPromise(`kubectl delete namespace ${env.rows[0].namespace} --ignore-not-found`);

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

module.exports = { 
  createEnvironment, 
  getEnvironments, 
  deleteEnvironment,
  getEnvironmentStatus
};