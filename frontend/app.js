document.addEventListener('DOMContentLoaded', () => {
    // State
    let selectedFile = null;

    // Elements
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const fileInput = document.getElementById('file-input');
    const fileNameDisplay = document.getElementById('file-name-display');
    const sendBtn = document.getElementById('send-btn');
    const messageInput = document.getElementById('message');
    const sendResult = document.getElementById('send-result');
    const generatedCode = document.getElementById('generated-code');
    const copyBtn = document.getElementById('copy-btn');
    const retrieveBtn = document.getElementById('retrieve-btn');
    const retrieveCodeInput = document.getElementById('retrieve-code');
    const retrieveResult = document.getElementById('retrieve-result');
    const contentDisplay = document.getElementById('content-display');
    const toast = document.getElementById('toast');

    // Tab Switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');

            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(`${tabId}-section`).classList.add('active');
        });
    });

    // File Selection
    fileInput.addEventListener('change', (e) => {
        selectedFile = e.target.files[0];
        if (selectedFile) {
            fileNameDisplay.textContent = `Selected: ${selectedFile.name}`;
        } else {
            fileNameDisplay.textContent = '';
        }
    });

    // Send Logic
    sendBtn.addEventListener('click', async () => {
        const message = messageInput.value.trim();

        if (!message && !selectedFile) {
            showToast('Please enter a message or upload a file');
            return;
        }

        sendBtn.disabled = true;
        sendBtn.textContent = 'Uploading...';

        const formData = new FormData();
        if (message) formData.append('message', message);
        if (selectedFile) formData.append('file', selectedFile);

        try {
         const response = await fetch('https://online-ew8m.onrender.com/api/send', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                generatedCode.textContent = data.code;
                sendResult.classList.remove('hidden');
                showToast('Content shared successfully!');

                // Clear inputs
                messageInput.value = '';
                fileInput.value = '';
                selectedFile = null;
                fileNameDisplay.textContent = '';
            } else {
                showToast('Error: ' + data.error);
            }
        } catch (error) {
            showToast('Connection failed');
        } finally {
            sendBtn.disabled = false;
            sendBtn.textContent = 'Generate Secret Code';
        }
    });

    // Retrieve Logic
    retrieveBtn.addEventListener('click', async () => {
        const code = retrieveCodeInput.value.trim().toUpperCase();

        if (!code) {
            showToast('Please enter a code');
            return;
        }

        retrieveBtn.disabled = true;
        retrieveBtn.textContent = 'Retrieving...';
        retrieveResult.classList.add('hidden');

        try {
         const response = await fetch(`https://online-ew8m.onrender.com/api/retrieve/${code}`);
            const data = await response.json();

            if (response.ok) {
                renderContent(data);
                retrieveResult.classList.remove('hidden');
            } else {
                showToast(data.error || 'Content not found');
            }
        } catch (error) {
            showToast('Connection failed');
        } finally {
            retrieveBtn.disabled = false;
            retrieveBtn.textContent = 'Retrieve Content';
        }
    });

    // Render Content Based on Type
    function renderContent(data) {
        contentDisplay.innerHTML = '';

        if (data.type === 'text') {
            const div = document.createElement('div');
            div.className = 'retrieved-text';
            div.textContent = data.content;
            contentDisplay.appendChild(div);
        } else {
            // File or Image
            const fileUrl = `/uploads/${data.content}`;

            if (data.type === 'image') {
                const img = document.createElement('img');
                img.src = fileUrl;
                img.className = 'image-preview';
                contentDisplay.appendChild(img);
            }

            const downloadLink = document.createElement('a');
            downloadLink.href = fileUrl;
            downloadLink.download = data.originalName;
            downloadLink.className = 'file-link';

            const icon = data.type === 'image' ? '🖼️' : (data.type === 'document' ? '📄' : '📁');
            downloadLink.innerHTML = `
                <span class="file-icon">${icon}</span>
                <div class="file-info">
                    <strong>${data.originalName}</strong>
                    <p class="small">Click to download</p>
                </div>
            `;
            contentDisplay.appendChild(downloadLink);
        }
    }

    // Copy to Clipboard
    copyBtn.addEventListener('click', () => {
        const code = generatedCode.textContent;
        navigator.clipboard.writeText(code);
        showToast('Code copied to clipboard!');
    });

    // Helper: Toast
    function showToast(msg) {
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }
});
