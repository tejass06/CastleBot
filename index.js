const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config();

// Validate environment variables
if (!process.env.TOKEN) {
    console.error('❌ ERROR: TOKEN is not defined in .env file');
    process.exit(1);
}
if (!process.env.PREFIX) {
    console.error('❌ ERROR: PREFIX is not defined in .env file');
    process.exit(1);
}
if (!process.env.MONGO_URI) {
    console.error('❌ ERROR: MONGO_URI is not defined in .env file');
    process.exit(1);
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent, // Essential for reading message content
        GatewayIntentBits.GuildVoiceStates, // Required for voice channel detection
    ],
});

// Lavalink (optional)
client.lavalink = null;

// Command Handler
client.commands = new Collection();
let totalCommands = 0;

try {
    const commandFolders = fs.readdirSync('./commands');
    for (const folder of commandFolders) {
        const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            try {
                const command = require(`./commands/${folder}/${file}`);
                if (command.name) {
                    client.commands.set(command.name, command);
                    totalCommands++;
                } else {
                    console.warn(`⚠️  Warning: Command in ${folder}/${file} is missing a name property`);
                }
            } catch (error) {
                console.error(`❌ Error loading command ${folder}/${file}:`, error.message);
            }
        }
    }
    console.log(`✅ Loaded ${totalCommands} commands successfully`);
} catch (error) {
    console.error('❌ Error loading commands:', error);
    process.exit(1);
}

// Music features removed: do not initialize Lavalink
client.lavalink = null;

// Event Handler (for the 'ready' event)
client.once('ready', () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Bot is online!`);
    console.log(`🤖 Logged in as: ${client.user.tag}`);
    console.log(`📊 Serving ${client.guilds.cache.size} server(s)`);
    console.log(`👥 Watching ${client.users.cache.size} user(s)`);
    console.log(`⚙️  Prefix: ${process.env.PREFIX}`);
    console.log(`📝 Commands loaded: ${totalCommands}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    client.user.setActivity(`${process.env.PREFIX}help`, { type: 'WATCHING' });
});

// Error handler for the client
client.on('error', error => {
    console.error('❌ Discord client error:', error);
});

client.on('warn', warning => {
    console.warn('⚠️  Discord client warning:', warning);
});

// Message Create Event (Command Execution)
client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;
    if (!message.content.startsWith(process.env.PREFIX)) return;

    const args = message.content.slice(process.env.PREFIX.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    try {
        await command.execute(message, args, client);
    } catch (error) {
        console.error(`❌ Error executing command "${commandName}":`, error);
        try {
            await message.reply('❌ There was an error trying to execute that command!');
        } catch (replyError) {
            console.error('❌ Could not send error message to user:', replyError);
        }
    }
});

// Connect to MongoDB
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB successfully!'))
    .catch(err => {
        console.error('❌ Could not connect to MongoDB:', err);
        process.exit(1);
    });

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    await mongoose.connection.close();
    client.destroy();
    console.log('✅ Bot shut down successfully');
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 SIGTERM received, shutting down gracefully...');
    await mongoose.connection.close();
    client.destroy();
    console.log('✅ Bot shut down successfully');
    process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Login to Discord
console.log('🔄 Logging in to Discord...');
client.login(process.env.TOKEN).catch(error => {
    console.error('❌ Failed to login:', error);
    process.exit(1);
});