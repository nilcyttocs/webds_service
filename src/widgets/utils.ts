import { MainAreaWidget, ReactWidget } from "@jupyterlab/apputils";

import { Message } from "@lumino/messaging";

import { FocusTracker } from "@lumino/widgets";

import { addExtensionUsage } from "../analytics/utils";

export const focusTracker: FocusTracker<WebDSWidget> = new FocusTracker();

const insertParentElement = (child: HTMLElement, newParent: HTMLElement) => {
  const parent = child.parentNode;
  if (parent) {
    parent.replaceChild(newParent, child);
    newParent.appendChild(child);
  }
};

export class WebDSWidget<
  T extends ReactWidget = ReactWidget
> extends MainAreaWidget {
  private widgetBody: any;
  private widgetComponent: any;
  private isScrolling = false;
  private oIframe = document.createElement("iframe");
  private iIframe = document.createElement("iframe");
  private widgetContainer = document.createElement("div");
  private widgetContent = document.createElement("div");
  private shadowTop = document.createElement("div");
  private shadowBottom = document.createElement("div");
  private outerPseudo = document.createElement("div");
  private innerPseudo = document.createElement("div");

  constructor(options: MainAreaWidget.IOptions<T>) {
    super(options);
    focusTracker.add(this);
    this.oIframe.style.cssText =
      "width: 0; height: 100%; margin: 0; padding: 0; position: absolute; background-color: transparent; overflow: hidden; border-width: 0;";
    this.iIframe.style.cssText =
      "width: 0; height: 100%; margin: 0; padding: 0; position: absolute; background-color: transparent; overflow: hidden; border-width: 0;";
    this.widgetContainer.setAttribute("id", this.id + "_container");
    this.widgetContainer.classList.add("jp-webds-widget-container");
    this.widgetContent.setAttribute("id", this.id + "_content");
    this.widgetContent.classList.add("jp-webds-widget");
    this.shadowTop.classList.add("jp-webds-widget-shadow");
    this.shadowTop.classList.add("jp-webds-widget-shadow-top");
    this.shadowBottom.classList.add("jp-webds-widget-shadow");
    this.shadowBottom.classList.add("jp-webds-widget-shadow-bottom");
    this.outerPseudo.style.cssText =
      "width: 100%; height: 100%; position: absolute; top: 0; left: 0; display: table;";
    this.innerPseudo.style.cssText =
      "display: table-cell; vertical-align: middle;";
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
    if (
      !this.widgetContainer.contains(this.shadowTop) &&
      !this.widgetContainer.contains(this.shadowBottom)
    ) {
      this.widgetContainer.appendChild(this.shadowTop);
      this.widgetContainer.appendChild(this.shadowBottom);
    }
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

  private _setPseudos() {
    if (this.widgetContent.contains(this.outerPseudo)) {
      return;
    }
    insertParentElement(this.widgetBody, this.innerPseudo);
    insertParentElement(this.innerPseudo, this.outerPseudo);
  }

  private _setParents() {
    if (this.widgetContainer.contains(this.widgetComponent)) {
      return;
    }
    insertParentElement(this.widgetComponent, this.widgetContent);
    insertParentElement(this.widgetContent, this.widgetContainer);
  }

  protected onAfterAttach(msg: Message) {
    super.onAfterAttach(msg);
    this._addUsage();
  }

  protected onActivateRequest(msg: Message) {
    super.onActivateRequest(msg);
    this.widgetComponent = document.getElementById(this.id + "_component");
    this.widgetBody = this.widgetComponent?.querySelector(
      ".jp-webds-widget-body"
    );
    if (this.widgetComponent && this.widgetBody) {
      this._setParents();
      this._setPseudos();
      this._setShadows();
    }
  }

  setShadows() {}
}
