const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

async function verifyActiveFilter() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('hookedcrm');
    const agents = db.collection('agentmasters');
    const leads = db.collection('leads');
    const dispositions = db.collection('dispositions');

    // Get closed dispositions
    const closedDispositions = await dispositions.find({
      status: { $regex: /^Closed/i },
      description: {
        $nin: ['Previously Sold', 'Fake', 'test des', 'test dispo long test dispo long g test dispo long', 'Test sale close']
      }
    }).toArray();

    const closedDispositionIds = closedDispositions.map(d => d._id);

    // Get today's sales
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const soldLeads = await leads.find({
      agencyId: new ObjectId(process.env.AGENCY_ID),
      dispositionId: { $in: closedDispositionIds },
      $or: [
        { modifiedDate: { $gte: today } },
        { salesDate: { $gte: today } },
        { createdAt: { $gte: today } }
      ]
    }).toArray();

    const agentIds = [...new Set(soldLeads.map(lead => lead.agentId?.toString()).filter(Boolean))];

    // Get ALL agents with sales (including inactive)
    const allAgentsWithSales = await agents.find({
      _id: { $in: agentIds.map(id => new ObjectId(id)) }
    }).toArray();

    // Get ONLY ACTIVE agents with sales
    const activeAgentsWithSales = await agents.find({
      _id: { $in: agentIds.map(id => new ObjectId(id)) },
      isActive: '1',
      softDelete: { $ne: '1' }
    }).toArray();

    console.log('\n=== Filtering Results ===');
    console.log(`Total agents with sales today: ${allAgentsWithSales.length}`);
    console.log(`Active agents with sales today: ${activeAgentsWithSales.length}`);
    console.log(`Inactive/deleted agents filtered out: ${allAgentsWithSales.length - activeAgentsWithSales.length}`);

    // Show examples of filtered agents
    const filteredAgents = allAgentsWithSales.filter(agent => {
      return agent.isActive !== '1' || agent.softDelete === '1';
    });

    if (filteredAgents.length > 0) {
      console.log('\n=== Agents Being Filtered Out ===');
      filteredAgents.slice(0, 5).forEach(agent => {
        const name = `${agent.fname || ''} ${agent.lname || ''}`.trim();
        console.log(`${name}: isActive=${agent.isActive}, softDelete=${agent.softDelete}`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

verifyActiveFilter();