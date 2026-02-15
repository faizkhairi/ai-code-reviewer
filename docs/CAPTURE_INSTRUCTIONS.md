# Screenshot/GIF Capture Instructions

## What to Capture: Streaming AI Code Review

**Type**: Animated GIF
**Duration**: 10-15 seconds
**File size target**: < 5MB
**Dimensions**: 800-1000px wide

---

## Steps to Record

1. **Open the app**: https://ai-code-reviewer-two-pi.vercel.app

2. **Start screen recording** (use ScreenToGif on Windows or built-in on macOS)

3. **Paste this sample code** with intentional issues:

```javascript
function calculateTotal(items) {
  var total = 0;
  for (var i = 0; i < items.length; i++) {
    total = total + items[i].price
  }
  return total
}

const userInput = req.query.name;
document.getElementById('greeting').innerHTML = 'Hello ' + userInput;
```

4. **Select language**: JavaScript

5. **Select provider**: Claude (or OpenAI - your choice)

6. **Select review type**: Security

7. **Click "Review Code"** and capture the streaming output

8. **Stop recording** once the review is complete (~10 seconds)

9. **Export as GIF**:
   - Format: GIF
   - Frame rate: 10 fps (to reduce file size)
   - Dimensions: 800-1000px width
   - File name: `demo.gif`
   - Location: `/c/Repo/ai-code-reviewer/docs/demo.gif`

---

## Tips

- Keep the browser window at a consistent size (around 1200px wide)
- Trim any dead time at the beginning/end
- Compress if needed: https://ezgif.com/optimize
