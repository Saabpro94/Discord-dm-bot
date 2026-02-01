const express = require('express');
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const app = express();
app.use(express.json());

const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.DirectMessages 
  ] 
});

const API_SECRET = process.env.API_SECRET;

// Route för Lovable
app.post('/send-dm', async (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || authHeader !== `Bearer ${API_SECRET}`) {
    console.log("Obehörigt försök");
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { discordId, message, embedTitle, embedColor } = req.body;

  try {
    const user = await client.users.fetch(discordId);
    
    const embed = new EmbedBuilder()
      .setTitle(embedTitle || 'Meddelande')
      .setDescription(message)
      .setColor(embedColor || 0x3b82f6)
      .setTimestamp();

    await user.send({ embeds: [embed] });
    console.log(`✅ DM skickat till ${discordId}`);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ DM Error:', error.message);
    res.status(500).json({ error: 'Failed to send DM' });
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);

// Tvinga port 3001
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Bot-servern körs nu på port ${PORT}`);
});
