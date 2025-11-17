# 🎙️ Voice Features Documentation

CastleBot now includes advanced Text-to-Speech (TTS) features with **Indian female voice** support across 9 languages!

## 📋 Table of Contents
- [Voice Note Generation](#voice-note-generation)
- [Voice Channel Speaking](#voice-channel-speaking)
- [Supported Languages](#supported-languages)
- [Common Issues](#common-issues)

---

## 🔊 Voice Note Generation

**Command:** `!speak <text> [language]`

**Description:** Generates a voice note (MP3 file) with Indian female voice and sends it as an attachment.

### Usage Examples:
```
!speak Hello everyone!
!speak नमस्ते दोस्तों! -lang hi
!speak வணக்கம் -lang ta
!speak Welcome to the server!
```

### Features:
- ✅ Generates MP3 voice notes
- ✅ Indian female accent (en-IN by default)
- ✅ Auto-cleanup after 5 seconds
- ✅ 500 character limit
- ✅ 9 Indian languages supported

### Aliases:
`!tts`, `!voice`, `!say`

---

## 🎤 Voice Channel Speaking

**Command:** `!vspeak <text> [language]`

**Description:** Bot joins your voice channel and speaks the text aloud with Indian female voice!

### Usage Examples:
```
!vspeak Hello everyone!
!vspeak नमस्ते दोस्तों! -lang hi
!vspeak வணக்கம் -lang ta
!vspeak Welcome to the server!
```

### Features:
- ✅ Bot joins your current voice channel
- ✅ Speaks text with Indian female voice
- ✅ Auto-disconnects after speaking
- ✅ Real-time status updates
- ✅ Permission checks (Connect & Speak)
- ✅ 500 character limit
- ✅ 9 Indian languages supported

### Requirements:
1. **You must be in a voice channel**
2. **Bot needs permissions:**
   - Connect (to join voice channel)
   - Speak (to play audio)

### Aliases:
`!vcspeak`, `!vtts`, `!vcvoice`

---

## 🌐 Supported Languages

| Language Code | Language Name | Voice Name |
|--------------|---------------|------------|
| `en` | English (India) | Indian Female - English |
| `hi` | Hindi | Indian Female - Hindi |
| `ta` | Tamil | Indian Female - Tamil |
| `te` | Telugu | Indian Female - Telugu |
| `bn` | Bengali | Indian Female - Bengali |
| `mr` | Marathi | Indian Female - Marathi |
| `gu` | Gujarati | Indian Female - Gujarati |
| `kn` | Kannada | Indian Female - Kannada |
| `ml` | Malayalam | Indian Female - Malayalam |

### How to Specify Language:
```
!speak <text> -lang <code>
!vspeak <text> -l <code>
```

**Examples:**
```
!speak Hello! -lang en        # Indian English
!speak नमस्ते! -lang hi       # Hindi
!speak வணக்கம்! -lang ta      # Tamil
!vspeak मराठी बोलतो -lang mr  # Marathi in VC
```

---

## 🛠️ Technical Details

### Voice Note Generation (`speak`)
1. User sends command with text
2. TTS audio generated via Google TTS API
3. MP3 file downloaded to `temp/` directory
4. File sent as Discord attachment
5. Auto-cleanup after 5 seconds

### Voice Channel Speaking (`vspeak`)
1. User sends command with text
2. Bot checks if user is in voice channel
3. Bot validates permissions (Connect & Speak)
4. TTS audio generated via Google TTS API
5. Bot joins voice channel
6. Audio streamed to voice channel
7. Bot disconnects after playback
8. Cleanup of temporary files

### Dependencies:
```json
{
  "google-tts-api": "^2.1.0",
  "axios": "^1.7.9",
  "@discordjs/voice": "^0.18.0",
  "@discordjs/opus": "^0.9.0"
}
```

---

## ❓ Common Issues

### Issue: "You need to be in a voice channel"
**Solution:** Join a voice channel before using `!vspeak`

### Issue: "Missing Permissions"
**Solution:** Ensure bot has **Connect** and **Speak** permissions in the voice channel

### Issue: "Text Too Long"
**Solution:** Keep text under 500 characters

### Issue: "Unsupported Language"
**Solution:** Use one of the supported language codes from the table above. Use `!vspeak` without arguments to see all languages.

### Issue: Bot doesn't join voice channel
**Troubleshooting:**
1. Check bot has permission to view channel
2. Check bot has Connect permission
3. Check bot has Speak permission
4. Try rejoining the voice channel yourself

### Issue: No audio playing in VC
**Troubleshooting:**
1. Check your Discord voice settings
2. Ensure bot is not muted (server or user level)
3. Check bot's volume slider in VC
4. Try `!speak` command first to test TTS generation

---

## 🎯 Use Cases

### Server Greetings:
```
!vspeak Welcome to our server! Please read the rules.
```

### Announcements:
```
!vspeak Attention everyone! Event starting in 5 minutes!
```

### Multilingual Support:
```
!vspeak स्वागत है सभी का! -lang hi
!vspeak வரவேற்பு! -lang ta
```

### Fun Interactions:
```
!speak This is a test message!
!vspeak The bot can speak in your voice channel!
```

---

## 📝 Notes

- **Indian Female Voice:** All TTS uses Indian female voice by default
- **Default Language:** English (India) - `en-IN`
- **File Cleanup:** Temporary MP3 files are automatically deleted
- **Rate Limiting:** No built-in rate limit (consider adding if needed)
- **Quality:** High-quality TTS from Google TTS API
- **Accent:** All voices use Indian accent/pronunciation

---

## 🔮 Future Enhancements

Potential features to add:
- [ ] Multiple voice options (male/female/child)
- [ ] Queue system for multiple TTS requests
- [ ] Custom voice speed control
- [ ] Voice effects (echo, reverb, etc.)
- [ ] TTS from file content
- [ ] Voice channel music playback
- [ ] Multi-server voice support

---

**Last Updated:** January 2025  
**Version:** 1.0  
**Maintainer:** CastleBot Team
