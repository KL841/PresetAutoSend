/**
 * @name PresetAutoSend
 * @author Kenlin
 * @description Preset auto send Mod beta // Questions? DM me ( DIscord: ```_cpvp_``` )  /// This plugin does not perform any automatic actions without user interaction.
All automated message sending is the sole responsibility of the user. ///

 * @version 1.0.0
 */

module.exports = class PresetAutoSend {
    constructor() {
        this.settings = BdApi.Data.load("PresetAutoSend", "settings") || { presets: [] };

        while (this.settings.presets.length < 8) {
            this.settings.presets.push({
                text: `P${this.settings.presets.length + 1} 내용`,
                speed: 1500
            });
        }

        this.container = null;
        this.modal = null;
        this.loops = {};
        this.buttons = [];
        this.allLoop = false;
        this.observer = null;
    }

    /* ===== Lifecycle ===== */

    start() {
        this.observe();
    }

    stop() {
        this.container?.remove();
        this.modal?.remove();
        this.stopAllLoops();
        this.observer?.disconnect();
        this.container = null;
    }

    save() {
        BdApi.Data.save("PresetAutoSend", "settings", this.settings);
    }

    observe() {
        this.observer = new MutationObserver(() => {
            const form = document.querySelector("form");
            if (!form) return;

            if (!this.container || !form.contains(this.container)) {
                this.container?.remove();
                this.container = null;
                this.injectUI();
            }
        });

        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    send(text) {
        const editor = document.querySelector(
            'div[role="textbox"][contenteditable="true"][data-slate-editor="true"]'
        );
        if (!editor) return;

        editor.focus();

        editor.dispatchEvent(new InputEvent("beforeinput", {
            inputType: "insertText",
            data: text,
            bubbles: true,
            cancelable: true
        }));

        editor.dispatchEvent(new KeyboardEvent("keydown", {
            key: "Enter",
            code: "Enter",
            keyCode: 13,
            bubbles: true
        }));
    }

    toggleLoop(index) {
        if (this.loops[index]) {
            clearTimeout(this.loops[index]);
            delete this.loops[index];
        } else {
            this.startLoop(index);
        }
        this.updateButtonColors();
    }

    startLoop(index) {
        const loop = () => {
            this.send(this.settings.presets[index].text);

            const base = this.settings.presets[index].speed;
            const delay = base + Math.random() * 300;

            this.loops[index] = setTimeout(loop, delay);
        };
        loop();
    }

    toggleAllLoop() {
        if (this.allLoop) {
            this.stopAllLoops();
        } else {
            for (let i = 0; i < 8; i++) {
                if (!this.loops[i]) this.startLoop(i);
            }
            this.allLoop = true;
        }
        this.updateButtonColors();
    }

    stopAllLoops() {
        Object.values(this.loops).forEach(clearTimeout);
        this.loops = {};
        this.allLoop = false;
        this.updateButtonColors();
    }

    updateButtonColors() {
        this.buttons.forEach((btn, i) => {
            btn.style.background = this.loops[i] ? "#ED4245" : "#5865F2";
        });

        if (this.allBtn) {
            this.allBtn.style.background = this.allLoop ? "#9B59B6" : "#34495E";
        }
    }
    injectUI() {
        const form = document.querySelector("form");
        if (!form || this.container) return;

        const container = document.createElement("div");
        this.container = container;

        Object.assign(container.style, {
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginTop: "6px",
            flexWrap: "wrap"
        });

        this.buttons = [];

        /* P1 ~ P8 */
        this.settings.presets.forEach((_, i) => {
            const btn = this.makeButton(`P${i + 1}`, "#5865F2");
            btn.onclick = () => this.send(this.settings.presets[i].text);
            btn.oncontextmenu = e => {
                e.preventDefault();
                this.toggleLoop(i);
            };
            this.buttons.push(btn);
            container.appendChild(btn);
        });

        /* P9 설정 */
        const settingBtn = this.makeButton("⚙", "#2ecc71");
        settingBtn.onclick = () => this.openSettings();
        container.appendChild(settingBtn);

        /* P10 전체 반복 */
        this.allBtn = this.makeButton("ALL", "#34495E");
        this.allBtn.onclick = () => this.toggleAllLoop();
        container.appendChild(this.allBtn);

        /* 크레딧 */
        const credit = document.createElement("div");
        credit.textContent = "PresetAutoSend Made by Kenlin (discord:_cpvp_)";

        Object.assign(credit.style, {
            marginLeft: "auto",
            color: "#b5b5b5",
            fontSize: "15.5px",
            fontWeight: "500",
            cursor: "pointer",
            userSelect: "none",
            textDecoration: "underline",
            textUnderlineOffset: "3px"
        });

        credit.onmouseenter = () => credit.style.color = "#ffffff";
        credit.onmouseleave = () => credit.style.color = "#b5b5b5";
        credit.onclick = () => {
            window.open("https://discord.com/users/_cpvp_", "_blank");
        };

        container.appendChild(credit);
        form.appendChild(container);
    }

    makeButton(label, color) {
        const btn = document.createElement("div");
        btn.textContent = label;

        Object.assign(btn.style, {
            width: "48px",
            height: "32px",
            background: color,
            color: "#fff",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontWeight: "bold",
            userSelect: "none"
        });

        return btn;
    }

    openSettings() {
        if (this.modal) return;

        const modal = document.createElement("div");
        this.modal = modal;

        Object.assign(modal.style, {
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999
        });

        const box = document.createElement("div");
        Object.assign(box.style, {
            width: "600px",
            background: "#2b2d31",
            padding: "20px",
            borderRadius: "12px",
            color: "#fff"
        });

        const title = document.createElement("h2");
        title.textContent = "PresetAutoSend Setting";
        box.appendChild(title);

        this.settings.presets.forEach((preset, i) => {
            const wrap = document.createElement("div");
            wrap.style.marginTop = "14px";

            const label = document.createElement("b");
            label.textContent = `P${i + 1}`;

            const input = document.createElement("textarea");
            input.value = preset.text;
            Object.assign(input.style, {
                width: "100%",
                height: "44px",
                marginTop: "4px",
                borderRadius: "6px"
            });

            input.oninput = e => {
                preset.text = e.target.value;
                this.save();
            };

            const speedWrap = document.createElement("div");
            speedWrap.style.marginTop = "6px";

            const speed = document.createElement("input");
            speed.type = "range";
            speed.min = 800;
            speed.max = 5000;
            speed.step = 100;
            speed.value = preset.speed;

            const speedLabel = document.createElement("span");
            speedLabel.textContent = ` ${preset.speed} ms`;
            speedLabel.style.marginLeft = "8px";
            speedLabel.style.color = "#aaa";

            speed.oninput = e => {
                preset.speed = Number(e.target.value);
                speedLabel.textContent = ` ${preset.speed} ms`;
                this.save();
            };

            speedWrap.append(speed, speedLabel);
            wrap.append(label, input, speedWrap);
            box.appendChild(wrap);
        });

        const close = document.createElement("button");
        close.textContent = "닫기";
        close.style.marginTop = "16px";
        close.onclick = () => {
            modal.remove();
            this.modal = null;
        };

        box.appendChild(close);
        modal.appendChild(box);
        document.body.appendChild(modal);
    }
};
