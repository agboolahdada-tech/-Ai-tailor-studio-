const designForm = document.getElementById('design-form');
const designButton = document.getElementById('design-button');
const designStatus = document.getElementById('design-status');
const designCanvas = document.getElementById('design-canvas');
const designDetails = document.getElementById('design-details');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');

document.getElementById('year').textContent = new Date().getFullYear();

designForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const description = document.getElementById('prompt').value.trim();
  if (!description) return;
  const payload = {
    description,
    category: document.getElementById('category').value,
    occasion: document.getElementById('occasion').value,
    colour: document.getElementById('colour').value.trim(),
    fabric: document.getElementById('fabric').value.trim(),
    modest: document.getElementById('modest').checked
  };
  designButton.disabled = true;
  designButton.innerHTML = 'Creating your concept… <span>✦</span>';
  designStatus.textContent = 'Your design is being prepared. This can take a little while.';
  designCanvas.hidden = true;
  designDetails.hidden = true;
  try {
    const response = await fetch('/api/design', {
      method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Could not generate the design.');
    const img = document.createElement('img');
    img.className = 'generated-image';
    img.alt = 'AI-generated fashion concept based on your description';
    img.src = `data:image/png;base64,${data.image}`;
    const oldImage = document.querySelector('.generated-image');
    if (oldImage) oldImage.remove();
    designCanvas.insertAdjacentElement('afterend', img);
    designStatus.textContent = 'Concept generated. Use it as inspiration, then confirm measurements and construction details before sewing.';
    designDetails.textContent = data.details || '';
    designDetails.hidden = !data.details;
  } catch (error) {
    designCanvas.hidden = false;
    designStatus.textContent = error.message + ' Check that the server is running and your API key is configured.';
  } finally {
    designButton.disabled = false;
    designButton.innerHTML = 'Generate fashion concept <span>✦</span>';
  }
});

function addMessage(text, role) {
  const node = document.createElement('div');
  node.className = `message ${role === 'user' ? 'user-message' : 'assistant-message'}`;
  node.textContent = text;
  chatMessages.appendChild(node);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return node;
}

async function askAssistant(text) {
  const prompt = text.trim();
  if (!prompt) return;
  document.querySelector('.suggestions')?.remove();
  addMessage(prompt, 'user');
  const waiting = addMessage('Thinking through your design…', 'assistant');
  try {
    const response = await fetch('/api/advice', {
      method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({question: prompt})
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'The assistant could not respond.');
    waiting.textContent = data.answer;
  } catch (error) {
    waiting.textContent = error.message + ' Make sure the server and API key are configured.';
  }
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

chatForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const text = chatInput.value;
  chatInput.value = '';
  await askAssistant(text);
});
document.querySelectorAll('.suggestions button').forEach(button => {
  button.addEventListener('click', () => askAssistant(button.textContent));
});
