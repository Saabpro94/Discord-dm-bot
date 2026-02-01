require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');

const app = express();
app.use(express.json());

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages],
  partials: ['CHANNEL']
});

let botReady = false;

client.once('ready', () => {
  console.log(`✅ Bot inloggad som ${client.user.tag}`);
  botReady = true;
});

app.post('/send-dm', async (req, res) => {
  const authHeader = req.headers['authorization'];
  if (authHeader !== `Bearer ${process.env.API_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!botReady) return res.status(503).json({ error: 'Bot not ready' });

  const { discordId, message } = req.body;

  try {
    const user = await client.users.fetch(discordId);
    await user.send(message);
    console.log(`✅ DM skickat till ${discordId}`);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Fel:', error.message);
    res.status(500).json({ error: error.message });
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
app.listen(process.env.PORT || 10000);
