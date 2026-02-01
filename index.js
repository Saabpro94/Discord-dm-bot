require('dotenv').config();
const express = require('express');
const { Client, GatewayIntentBits, Partials, EmbedBuilder } = require('discord.js');

const app = express();
app.use(express.json());

const API_SECRET = process.env.API_SECRET;

// Discord client med rätt intents för DM
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [
    Partials.Channel,  // Krävs för DM!
    Partials.Message,
  ],
});

client.once('ready', () => {
  console.log(`✅ Bot online som ${client.user.tag}`);
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'Bot is running', ready: client.isReady() });
});

// DM endpoint
app.post('/send-dm', async (req, res) => {
  // Verifiera API-nyckel
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${API_SECRET}`) {
    console.log('❌ Unauthorized request');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { discordId, message, embedTitle, embedColor } = req.body;

  if (!discordId || !message) {
    return res.status(400).json({ error: 'Missing discordId or message' });
  }

  try {
    // Hämta användaren
    const user = await client.users.fetch(discordId);
    
    // Skapa embed
    const embed = new EmbedBuilder()
      .setTitle(embedTitle || 'Meddelande')
      .setDescription(message)
      .setColor(embedColor || 0x3b82f6)
      .setTimestamp()
      .setFooter({ text: 'Rekryteringsenheten' });

    // Skicka DM
    await user.send({ embeds: [embed] });
    
    console.log(`✅ DM skickat till ${user.tag}`);
    res.json({ success: true, sentTo: user.tag });
  } catch (error) {
    console.error('❌ DM-fel:', error.message);
    
    // Specifika felmeddelanden
    if (error.code === 50007) {
      return res.status(400).json({ error: 'User has DMs disabled' });
    }
    if (error.code === 10013) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(500).json({ error: 'Failed to send DM', details: error.message });
  }
});

// Starta bot och server
client.login(process.env.DISCORD_BOT_TOKEN);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 API-server körs på port ${PORT}`);
});
