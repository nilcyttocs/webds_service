import { MainAreaWidget, ReactWidget } from "@jupyterlab/apputils";

import { Message } from "@lumino/messaging";

import { FocusTracker } from "@lumino/widgets";

import { addExtensionUsage } from "../analytics/utils";

export const focusTracker: FocusTracker<WebDSWidget> = new FocusTracker();

export class WebDSWidget<
  T extends ReactWidget = ReactWidget
> extends MainAreaWidget {
  private widgetContainer: any;
  private widgetContent: any;
  private widgetBody: any;
  private isScrolling = false;
  private oIframe = document.createElement("iframe");
  private iIframe = document.createElement("iframe");

  constructor(options: MainAreaWidget.IOptions<T>) {
    super(options);
    focusTracker.add(this);
    this.oIframe.style.cssText =
      "width: 0; height: 100%; margin: 0; padding: 0; position: absolute; background-color: transparent; overflow: hidden; border-width: 0;";
    this.iIframe.style.cssText =
      "width: 0; height: 100%; margin: 0; padding: 0; position: absolute; background-color: transparent; overflow: hidden; border-width: 0;";
  }

  private _addUsage() {
    addExtensionUsage(this.title.label);
  }

  private _addRemoveShadows(event: any) {
    if (!this.isScrolling) {
      window.requestAnimationFrame(() => {
        if (event.target.scrollTop > 0) {
          this.widgetContainer.classList.add("off-top");
        } else {
          this.widgetContainer.classList.remove("off-top");
        }
        if (
          Math.abs(
            event.target.scrollHeight -
              event.target.clientHeight -
              event.target.scrollTop
          ) > 3
        ) {
          this.widgetContainer.classList.add("off-bottom");
        } else {
          this.widgetContainer.classList.remove("off-bottom");
        }
        this.isScrolling = false;
      });
      this.isScrolling = true;
    }
  }

  private _addIframeResizeDetection() {
    this.oIframe.onload = () => {
      this.oIframe.contentWindow?.addEventListener("resize", () => {
        try {
          var evt = new UIEvent("resize");
          this.oIframe.parentElement?.dispatchEvent(evt);
        } catch (e) {}
      });
    };
    this.iIframe.onload = () => {
      this.iIframe.contentWindow?.addEventListener("resize", () => {
        try {
          var evt = new UIEvent("resize");
          this.iIframe.parentElement?.parentElement?.dispatchEvent(evt);
        } catch (e) {}
      });
    };
    this.widgetContent.appendChild(this.oIframe);
    this.widgetBody.appendChild(this.iIframe);
  }

  private _setShadows() {
    this.widgetContainer = document.getElementById(this.id + "_container");
    this.widgetContent = document.getElementById(this.id + "_content");
    this.widgetBody = this.widgetContent?.querySelector(
      ".jp-webds-widget-body"
    );
    if (this.widgetContainer && this.widgetContent && this.widgetBody) {
      this._addIframeResizeDetection();
      this.widgetContent.addEventListener(
        "scroll",
        this._addRemoveShadows.bind(this)
      );
      this.widgetContent.addEventListener(
        "resize",
        this._addRemoveShadows.bind(this)
      );
      setTimeout(() => {
        if (this.widgetContent.scrollHeight > this.widgetContent.clientHeight) {
          this.widgetContainer.classList.add("off-bottom");
        }
      }, 500);
    }
  }

  protected onAfterAttach(msg: Message) {
    super.onAfterAttach(msg);
    this._addUsage();
  }

  protected onActivateRequest(msg: Message) {
    super.onActivateRequest(msg);
    this._setShadows();
  }

  setShadows() {}
}
