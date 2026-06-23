/* Codebase Q&A — frontend */

const form           = document.getElementById('ask-form');
const questionEl     = document.getElementById('question');
const collectionEl   = document.getElementById('collection');
const mockEl         = document.getElementById('mock-mode');
const submitBtn      = document.getElementById('submit-btn');
const statusEl       = document.getElementById('status');
const resultEl       = document.getElementById('result');
const questionDisplay = document.getElementById('question-display');
const answerDisplay  = document.getElementById('answer-display');
const sourcesSectionEl = document.getElementById('sources-section');
const sourcesList    = document.getElementById('sources-list');

// Submit on Ctrl+Enter / Cmd+Enter
questionEl.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') form.requestSubmit();
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const question = questionEl.value.trim();
  if (!question) return;

  resetUI();
  setLoading(true);

  // Show question immediately
  questionDisplay.textContent = question;
  resultEl.hidden = false;
  answerDisplay.textContent = '';
  answerDisplay.classList.add('streaming');

  try {
    const resp = await fetch('/ask/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        collection: collectionEl.value.trim() || 'codebase',
        mock: mockEl.checked,
      }),
    });

    if (!resp.ok) {
      throw new Error(`Server responded with ${resp.status} ${resp.statusText}`);
    }

    setLoading(false);

    // Read SSE stream
    const reader  = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();         // last incomplete line stays in buffer

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const payload = line.slice(6).trim();
        if (payload === '[DONE]') continue;

        let event;
        try { event = JSON.parse(payload); } catch { continue; }

        if (event.type === 'text') {
          answerDisplay.textContent += event.content;
        } else if (event.type === 'sources') {
          renderSources(event.content);
        }
      }
    }
  } catch (err) {
    setLoading(false);
    const msg = err.message.toLowerCase().includes('fetch')
      ? 'Cannot reach the backend — is the server running on port 8000?'
      : err.message;
    setError(msg);
  } finally {
    answerDisplay.classList.remove('streaming');
    submitBtn.disabled = false;
  }
});

/* ── helpers ── */

function resetUI() {
  statusEl.hidden    = true;
  statusEl.className = 'status';
  statusEl.innerHTML = '';
  sourcesSectionEl.hidden = true;
  sourcesList.innerHTML   = '';
}

function setLoading(active) {
  submitBtn.disabled = active;
  if (active) {
    statusEl.hidden    = false;
    statusEl.className = 'status loading';
    statusEl.innerHTML =
      'Thinking… <span class="dots"><span></span><span></span><span></span></span>';
  } else if (statusEl.classList.contains('loading')) {
    statusEl.hidden = true;
  }
}

function setError(msg) {
  statusEl.hidden    = false;
  statusEl.className = 'status error';
  statusEl.textContent = `Error: ${msg}`;
}

function renderSources(sources) {
  if (!sources || sources.length === 0) return;
  const seen = new Set();
  for (const s of sources) {
    const ref = `${s.file}:${s.start_line}-${s.end_line}`;
    if (seen.has(ref)) continue;
    seen.add(ref);
    const li = document.createElement('li');
    li.textContent = ref;
    sourcesList.appendChild(li);
  }
  sourcesSectionEl.hidden = false;
}
