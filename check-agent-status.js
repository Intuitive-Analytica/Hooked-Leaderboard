const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

async function checkAgentStatus() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('hookedcrm');
    const agents = db.collection('agentmasters');

    // Get a sample of agents to see the structure
    const sampleAgents = await agents.find({}).limit(5).toArray();

    console.log('\n=== Agent Structure Analysis ===');
    if (sampleAgents.length > 0) {
      const agent = sampleAgents[0];
      console.log('Fields in agent document:');
      Object.keys(agent).forEach(key => {
        const value = agent[key];
        const type = Array.isArray(value) ? 'array' : typeof value;

        // Look for active/inactive related fields
        if (key.toLowerCase().includes('active') ||
            key.toLowerCase().includes('status') ||
            key.toLowerCase().includes('disable') ||
            key.toLowerCase().includes('delete') ||
            key.toLowerCase().includes('inactive')) {
          console.log(`  >>> ${key}: ${type} = ${value}`);
        } else {
          console.log(`  ${key}: ${type}`);
        }
      });
    }

    // Check for active/inactive agents
    console.log('\n=== Active Status Analysis ===');

    // Count agents by different potential active fields
    const totalAgents = await agents.countDocuments({});
    console.log(`Total agents: ${totalAgents}`);

    // Check for isActive field
    const withIsActive = await agents.countDocuments({ isActive: { $exists: true } });
    if (withIsActive > 0) {
      const activeCount = await agents.countDocuments({ isActive: true });
      const inactiveCount = await agents.countDocuments({ isActive: false });
      console.log(`\nField 'isActive' found:`);
      console.log(`  Active agents: ${activeCount}`);
      console.log(`  Inactive agents: ${inactiveCount}`);
    }

    // Check for status field
    const withStatus = await agents.countDocuments({ status: { $exists: true } });
    if (withStatus > 0) {
      const statuses = await agents.distinct('status');
      console.log(`\nField 'status' found with values: ${statuses.join(', ')}`);
    }

    // Check for softDelete field
    const withSoftDelete = await agents.countDocuments({ softDelete: { $exists: true } });
    if (withSoftDelete > 0) {
      const softDeletedCount = await agents.countDocuments({ softDelete: 'yes' });
      const notDeletedCount = await agents.countDocuments({ softDelete: { $ne: 'yes' } });
      console.log(`\nField 'softDelete' found:`);
      console.log(`  Soft deleted: ${softDeletedCount}`);
      console.log(`  Not deleted: ${notDeletedCount}`);
    }

    // Sample some agents with their active status
    console.log('\n=== Sample Agents with Status ===');
    const agentSamples = await agents.find({}).limit(10).toArray();
    agentSamples.forEach(agent => {
      const name = `${agent.fname || ''} ${agent.lname || ''}`.trim();
      const isActive = agent.isActive;
      const softDelete = agent.softDelete;
      const status = agent.status;
      console.log(`${name}: isActive=${isActive}, softDelete=${softDelete}, status=${status}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkAgentStatus();