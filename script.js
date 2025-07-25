let currentQRCode = null;
        let qrDataUrl = '';
        let currentText = '';

        function generateQRCode() {
            const qrDiv = document.getElementById('qr-code');
            const qrActions = document.getElementById('qr-actions');
            const preview = document.getElementById('content-preview');
            const previewText = document.getElementById('preview-text');
            currentText = document.getElementById('text').value.trim();

            if (!currentText) {
                showToast('Please enter text or URL');
                return;
            }

            qrDiv.innerHTML = '';
            qrDiv.classList.remove('hidden');
            preview.style.display = 'none';
            
            // Generate QR code with black color
            currentQRCode = new QRCode(qrDiv, {
                text: currentText,
                width: 200,
                height: 200,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });

            // Update preview
            previewText.textContent = currentText;
            preview.style.display = 'block';

            // Get the data URL of the QR code image after a small delay
            setTimeout(() => {
                const img = qrDiv.querySelector('img');
                if (img) {
                    qrDataUrl = img.src;
                    qrActions.classList.remove('hidden');
                }
            }, 100);
        }

        function downloadQRCode() {
            if (!qrDataUrl) {
                showToast('No QR code to download');
                return;
            }

            const link = document.createElement('a');
            link.href = qrDataUrl;
            link.download = 'qrcode.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast('QR code downloaded');
        }

        function copyQRCode() {
            if (!qrDataUrl) {
                showToast('No QR code to copy');
                return;
            }

            // Create a temporary canvas to copy the image
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = function() {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                
                canvas.toBlob(function(blob) {
                    navigator.clipboard.write([
                        new ClipboardItem({
                            'image/png': blob
                        })
                    ]).then(() => {
                        showToast('QR code copied to clipboard');
                    }).catch(err => {
                        console.error('Failed to copy:', err);
                        showToast('Failed to copy QR code');
                    });
                });
            };
            
            img.src = qrDataUrl;
        }

        function shareQRCode() {
            if (!qrDataUrl) {
                showToast('No QR code to share');
                return;
            }

            if (navigator.share) {
                // Convert data URL to blob
                fetch(qrDataUrl)
                    .then(res => res.blob())
                    .then(blob => {
                        const file = new File([blob], 'qrcode.png', { type: 'image/png' });
                        navigator.share({
                            title: 'QR Code',
                            text: currentText || 'Check out this QR code I generated',
                            files: [file]
                        }).catch(err => {
                            console.log('Sharing failed:', err);
                            showToast('Sharing cancelled');
                        });
                    });
            } else {
                // Fallback for browsers that don't support sharing files
                const link = document.createElement('a');
                link.href = qrDataUrl;
                link.target = '_blank';
                link.click();
                showToast('QR code opened in new tab');
            }
        }

        function showToast(message) {
            const toast = document.getElementById('toast');
            toast.textContent = message;
            toast.classList.add('show');
            
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }