# 🌐 Translation Feature - Quick Guide

## ✨ NEW FEATURE: Reply-to-Translate

Your bot now has **powerful translation capabilities** especially optimized for **Indian languages**!

---

## 🚀 How to Use

### Basic Translation (Reply-to-Message)

1. **Reply to any message** (right-click → Reply, or long-press on mobile)
2. Type: `!translate <language_code>`

**Examples:**

```
User posts: "வணக்கம், எப்படி இருக்கிறீர்கள்?"
You reply: !translate en
Bot: Translates Tamil → English: "Hello, how are you?"
```

```
User posts: "Hello, how are you?"
You reply: !translate ta
Bot: Translates English → Tamil: "வணக்கம், எப்படி இருக்கிறீர்கள்?"
```

---

## 🇮🇳 Supported Indian Languages

| Code | Language | Native Name |
|------|----------|-------------|
| `hi` | Hindi | हिन्दी |
| `ta` | Tamil | தமிழ் |
| `te` | Telugu | తెలుగు |
| `bn` | Bengali | বাংলা |
| `mr` | Marathi | मराठी |
| `gu` | Gujarati | ગુજરાતી |
| `kn` | Kannada | ಕನ್ನಡ |
| `ml` | Malayalam | മലയാളം |
| `pa` | Punjabi | ਪੰਜਾਬੀ |
| `ur` | Urdu | اردو |

---

## 🌍 Popular International Languages

| Code | Language |
|------|----------|
| `en` | English |
| `es` | Spanish |
| `fr` | French |
| `de` | German |
| `ja` | Japanese |
| `ko` | Korean |
| `ar` | Arabic |
| `ru` | Russian |
| `zh` | Chinese |

---

## 📝 All Commands

### Translate a Message
```
!translate <language_code>
```
**Aliases:** `!tr`, `!trans`

Reply to a message and use this command to translate it.

### Show Help
```
!translate
```
Shows help and examples.

### List All Languages
```
!translate list
```
Shows all supported languages with their codes.

### Detect Language
```
!translate detect
```
Reply to a message to detect what language it's in.

---

## 💡 Real-World Examples

### Example 1: Tamil to English
```
Message: "நான் இன்று மிகவும் சந்தோஷமாக இருக்கிறேன்"
Reply: !translate en
Result: "I am very happy today"
```

### Example 2: English to Hindi
```
Message: "Good morning, have a great day!"
Reply: !translate hi
Result: "सुप्रभात, अच्छा दिन हो!"
```

### Example 3: Telugu to Tamil
```
Message: "మీరు ఎలా ఉన్నారు?"
Reply: !translate ta
Result: "நீங்கள் எப்படி இருக்கிறீர்கள்?"
```

### Example 4: Detect Unknown Language
```
Message: "こんにちは、元気ですか？"
Reply: !translate detect
Result: Detected Language: 🇯🇵 Japanese (日本語)
```

---

## 🎯 Use Cases

### 1. **International Servers**
Help members from different countries communicate!

### 2. **Indian Regional Servers**
Bridge language barriers between Tamil, Telugu, Hindi, and other Indian language speakers.

### 3. **Learning Languages**
Users can see translations to learn new phrases.

### 4. **Customer Support**
Understand messages from users in any language.

### 5. **Moderation**
Understand what users are saying in different languages.

---

## ⚙️ Features

✅ **Auto-detects source language** - Just specify target language
✅ **Supports 20+ languages** - Including all major Indian languages
✅ **Works with replies** - Natural Discord workflow
✅ **Language detection** - Find out what language a message is in
✅ **Shortcuts** - Use `!tr` or `!trans` for quick access
✅ **Beautiful embeds** - Clean, easy-to-read translations
✅ **Flag indicators** - Visual language identification

---

## 🔧 Technical Details

**Translation Engine:** Google Translate API
**Supported Text Length:** Up to 5000 characters
**Detection Accuracy:** High (with confidence indicator)
**Response Time:** ~1-3 seconds
**Offline Mode:** No (requires internet connection)

---

## 🆘 Troubleshooting

### "No Message Reply" error
- Make sure you **reply** to the message, not just mention it
- Use the reply button in Discord (right-click → Reply)

### "Invalid Language Code" error
- Use `!translate list` to see all valid codes
- Common codes: `en`, `hi`, `ta`, `te`

### Translation seems wrong
- Auto-detection works best with longer text
- Slang or informal language may not translate well
- Try `!translate detect` to verify the source language

### "Translation Failed" error
- Check your internet connection
- Message might be too long (max 5000 chars)
- Try again after a few seconds

---

## 💡 Pro Tips

1. **Shorter is better** - Short phrases translate more accurately
2. **Context matters** - Full sentences work better than single words
3. **Check detection** - Use `!translate detect` if translation seems off
4. **Use shortcuts** - `!tr en` is faster than `!translate en`
5. **Chain translations** - Translate Tamil → English, then English → Hindi

---

## 📊 Command Statistics

After implementation:
- **Total Commands:** 14 (was 13)
- **New Command:** `translate`
- **New Utility File:** `translator.js`
- **Languages Supported:** 20+
- **Indian Languages:** 10

---

## 🎮 Try It Now!

1. Go to your Discord server
2. Post a message in any language (or have someone else post)
3. Reply to that message
4. Type: `!translate en` (or any language code)
5. Watch the magic happen! ✨

---

## 🌟 What Makes This Unique?

Unlike other bots that require complex syntax like:
```
!translate from:tamil to:english "text here"
```

Our bot is **super simple**:
```
Just reply and type: !translate en
```

**That's it!** The bot:
- ✅ Auto-detects the source language
- ✅ Grabs the replied message automatically
- ✅ Shows beautiful formatted translations
- ✅ Includes language flags and native names

---

## 📈 Future Enhancements (Ideas)

- [ ] Auto-translate channels (all messages auto-translate)
- [ ] Custom language preferences per user
- [ ] Translation history
- [ ] Pronunciation guide
- [ ] Voice message translation
- [ ] Image text translation (OCR)

---

**Your bot now speaks 20+ languages, with special love for Indian regional languages!** 🇮🇳🌐

Try it out and let multilingual communication begin! 🎉
