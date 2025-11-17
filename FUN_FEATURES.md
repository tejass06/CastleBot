# 🎭 Fun Impersonation Features

CastleBot now includes **3 hilarious impersonation commands** using webhooks! Perfect for pranks and fun!

## 📋 Commands Overview

### 1. 🎭 Impersonate Command
**Impersonate any user** by copying their username, nickname, and profile picture!

### 2. 👻 Ghost Ping Command
Send a **ping that disappears** immediately - user gets notified but sees nothing!

### 3. 💬 Say As Command
Make the bot say anything **as any custom name/avatar** you want!

---

## 🎭 1. Impersonate Command

**Command:** `!impersonate <@user> <message>`

**Description:** Creates a webhook that looks EXACTLY like another user and sends a message as them!

### Usage Examples:
```
!impersonate @John Hello everyone!
!impersonate @Sarah I love pizza!
!impersonate @Mike This bot is amazing!
```

### Features:
- ✅ Copies exact username
- ✅ Copies profile picture
- ✅ Copies server nickname (if any)
- ✅ Auto-deletes your command message
- ✅ Looks 100% real!

### Aliases:
`!fake`, `!mimic`, `!pretend`, `!ghost`

### Requirements:
- You need **Manage Webhooks** permission
- Bot needs **Manage Webhooks** permission

---

## 👻 2. Ghost Ping Command

**Command:** `!ghostping <@user> [message]`

**Description:** Sends a ping to someone that gets deleted instantly! They get the notification but when they check, there's nothing there! 😄

### Usage Examples:
```
!ghostping @John
!ghostping @Sarah Hey there!
!ghostping @Mike This will vanish!
```

### How It Works:
1. Bot sends a message pinging the user
2. Message gets deleted in 0.1 seconds
3. User gets Discord notification
4. User clicks notification → sees nothing!
5. Perfect harmless prank! 👻

### Features:
- ✅ Instant deletion
- ✅ User still gets notified
- ✅ Confirmation sent to your DM
- ✅ Auto-cleanup
- ✅ Totally harmless fun!

### Aliases:
`!gping`, `!phantom`

---

## 💬 3. Say As Command

**Command:** `!sayas <name> [avatar_url] <message>`

**Description:** Make the bot say anything as ANY custom name and avatar you want!

### Usage Examples:
```
!sayas "Elon Musk" Hello everyone!
!sayas Bot Welcome to the server!
!sayas "Iron Man" https://example.com/avatar.png I am Iron Man!
```

### Features:
- ✅ Custom name (use quotes for names with spaces)
- ✅ Optional custom avatar URL
- ✅ Unlimited creativity
- ✅ Perfect for roleplay
- ✅ Great for announcements

### Aliases:
`!talkas`, `!speakas`

### Pro Tips:
- Use **quotes** for names with spaces: `!sayas "John Doe" message`
- Avatar URL is **optional** - bot will use default if not provided
- Make it funny - impersonate celebrities, characters, etc!

---

## ⚙️ Permissions Required

### For All Commands:
- **User:** Manage Webhooks permission
- **Bot:** Manage Webhooks permission

### How to Give Permissions:
1. Go to Server Settings → Roles
2. Find the role you want to give permission to
3. Enable "Manage Webhooks"
4. Save changes

---

## 🎯 Use Cases

### Server Announcements:
```
!sayas "Server Admin" Important announcement!
```

### Roleplay:
```
!sayas "Naruto" Believe it!
!sayas "Sherlock Holmes" Elementary, my dear Watson.
```

### Fun Pranks:
```
!impersonate @Friend I'm deleting Discord!
!ghostping @Friend (they'll be confused!)
```

### Memes:
```
!sayas "Thanos" I am inevitable.
!sayas "Spider-Man" With great power comes great responsibility.
```

---

## 🛡️ Safety & Responsibility

### ⚠️ Important Rules:
1. **Use for FUN only** - not to harass or bully
2. **Don't impersonate to spread misinformation**
3. **Respect others** - stop if someone asks
4. **Don't violate Discord ToS**
5. **Use responsibly** - these are powerful tools!

### Best Practices:
- ✅ Use with friends who understand it's a joke
- ✅ Make it obviously fake/funny
- ✅ Use in appropriate channels only
- ✅ Stop if someone gets upset
- ❌ Don't use to deceive or harm
- ❌ Don't impersonate mods/admins maliciously
- ❌ Don't spread false information

---

## 🔧 Technical Details

### How Webhooks Work:
1. Bot creates a temporary webhook in the channel
2. Webhook can have any name/avatar
3. Message is sent through the webhook
4. Webhook is immediately deleted
5. Message remains but webhook is gone

### Why These Commands Are Cool:
- **No API limits** - webhooks are fast
- **Instant deletion** - clean and smooth
- **Perfect impersonation** - looks 100% real
- **Auto-cleanup** - no webhook spam
- **Safe** - only works with proper permissions

---

## 🎨 Creative Ideas

### 1. Motivational Quotes:
```
!sayas "Albert Einstein" Imagination is more important than knowledge.
!sayas "Steve Jobs" Innovation distinguishes between a leader and a follower.
```

### 2. Character Roleplay:
```
!sayas "Dumbledore" Welcome to Hogwarts!
!sayas "Yoda" Do or do not, there is no try.
```

### 3. Funny Announcements:
```
!sayas "Pizza Bot" 🍕 Pizza party at 5 PM!
!sayas "Game Master" Next event starts in 10 minutes!
```

### 4. Harmless Pranks:
```
!ghostping @Friend
!impersonate @Friend I just won the lottery!
```

---

## 📊 Bot Status

**Total Commands:** 19
- Admin: 2
- Mod: 7
- Utility: 4
- Stats: 1
- Voice: 2
- **Fun: 3** ← NEW!

---

## 🎮 Try Them Now!

1. **Make sure bot has Manage Webhooks permission**
2. **Give yourself Manage Webhooks permission**
3. **Try the commands:**

```bash
# Impersonate a friend
!impersonate @YourFriend Hello everyone!

# Ghost ping someone (harmless prank)
!ghostping @YourFriend Boo!

# Say something as anyone
!sayas "Elon Musk" To the moon! 🚀
```

---

## 🤔 Troubleshooting

### Issue: "Missing Permissions"
**Solution:** Both you and the bot need **Manage Webhooks** permission

### Issue: "User Not Found"
**Solution:** Make sure to properly mention the user or use valid user ID

### Issue: Avatar not showing in !sayas
**Solution:** Make sure the avatar URL is valid and publicly accessible (starts with http:// or https://)

### Issue: Command message not deleting
**Solution:** Bot needs **Manage Messages** permission to delete your command

---

## 🌟 What Makes This Unique?

✨ **Perfect Impersonation** - Looks exactly like the real user  
✨ **Ghost Ping** - Harmless prank that's actually funny  
✨ **Custom Identity** - Be anyone you want  
✨ **Auto-Cleanup** - No webhook spam in server settings  
✨ **Safe & Fun** - Permission-based access  
✨ **Indian Bot First** - Not many Indian bots have this!  

---

**Last Updated:** November 2025  
**Version:** 1.0  
**Category:** Fun & Entertainment  

🎉 Have fun with these commands! Use them wisely and spread joy! 🎭
