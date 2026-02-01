const express = require('express');
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const app = express();
app.use(express.json());

const client = new Client({ 
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages] 
});

const API_SECRET = process.env.API_SECRET;

// VIKTIGT: Denna del tar emot anropet från Lovable
app.post('/send-dm', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${API_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { discordId, message, embedTitle, embedColor } = req.body;

  try {
    const user = await client.users.fetch(discordId);
    
    const embed = new EmbedBuilder()
      .setTitle(embedTitle || 'Meddelande')
      .setDescription(message)
      .setColor(embedColor || 0x3b82f6)
      .setTimestamp()
      .setFooter({ text: 'Rekryteringsenheten' });

    await user.send({ embeds: [embed] });
    res.json({ success: true });
  } catch (error) {
    console.error('DM Error:', error);
    res.status(500).json({ error: 'Failed to send DM', details: error.message });
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);

// Render använder process.env.PORT
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server körs på port ${PORT}`);
});
