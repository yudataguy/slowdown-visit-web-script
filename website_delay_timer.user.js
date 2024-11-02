// ==UserScript==
// @name         Website Delay Timer
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Adds a 10-minute delay timer to specified websites
// @author       You
// @match        *://*/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function() {
    'use strict';

    // Get the list of delayed websites from storage
    let delayedSites = GM_getValue('delayedSites', []);
    const DELAY_TIME = 600; // 10 minutes in seconds

    // Check if current site is in the delayed sites list
    function shouldDelay() {
        const currentHost = window.location.hostname;
        return delayedSites.some(site => currentHost.includes(site));
    }

    // Create and show the timer overlay
    function createTimerOverlay() {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.97);
            z-index: 999999;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: white;
            font-family: Arial, sans-serif;
        `;

        const contentWrapper = document.createElement('div');
        contentWrapper.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 30px;
        `;

        const timerDisplay = document.createElement('div');
        timerDisplay.style.cssText = `
            font-size: 72px;
            font-weight: bold;
        `;

        const cancelButton = document.createElement('button');
        cancelButton.style.cssText = `
            padding: 12px 24px;
            font-size: 18px;
            background: #ff4444;
            border: none;
            border-radius: 8px;
            color: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            min-width: 120px;
            line-height: 1;
        `;
        cancelButton.textContent = 'Leave Site';
        cancelButton.onclick = () => window.history.back();

        contentWrapper.appendChild(timerDisplay);
        contentWrapper.appendChild(cancelButton);
        overlay.appendChild(contentWrapper);
        document.body.appendChild(overlay);

        let timeLeft = DELAY_TIME;
        const timer = setInterval(() => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

            if (timeLeft <= 0) {
                clearInterval(timer);
                overlay.remove();
            }
            timeLeft--;
        }, 1000);
    }

    // Add site to delayed list
    function addSite() {
        const site = prompt('Enter website domain to delay (e.g., facebook.com):');
        if (site && !delayedSites.includes(site)) {
            delayedSites.push(site);
            GM_setValue('delayedSites', delayedSites);
            alert(`${site} has been added to delayed sites.`);
        }
    }

    // Remove site from delayed list
    function removeSite() {
        if (delayedSites.length === 0) {
            alert('No sites in the delay list.');
            return;
        }

        const site = prompt(`Current delayed sites:\n${delayedSites.join('\n')}\n\nEnter website domain to remove:`);
        const index = delayedSites.indexOf(site);
        if (index > -1) {
            delayedSites.splice(index, 1);
            GM_setValue('delayedSites', delayedSites);
            alert(`${site} has been removed from delayed sites.`);
        } else {
            alert('Site not found in delay list.');
        }
    }

    // Register menu commands
    GM_registerMenuCommand('Add Site to Delay List', addSite);
    GM_registerMenuCommand('Remove Site from Delay List', removeSite);

    // Main execution
    if (shouldDelay()) {
        createTimerOverlay();
    }
})();