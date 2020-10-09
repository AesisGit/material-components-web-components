/**
@license
Copyright 2019 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import '@material/mwc-icon/mwc-icon';
import '@material/mwc-ripple/mwc-ripple';

import {Ripple} from '@material/mwc-ripple/mwc-ripple';
import {RippleHandlers} from '@material/mwc-ripple/ripple-handlers';
import {eventOptions, html, internalProperty, LitElement, property, query, queryAsync} from 'lit-element';
import {classMap} from 'lit-html/directives/class-map';

/** @soyCompatible */
export class ButtonBase extends LitElement {
  @property({type: Boolean}) raised = false;

  @property({type: Boolean}) unelevated = false;

  @property({type: Boolean}) outlined = false;

  @property({type: Boolean}) dense = false;

  @property({type: Boolean, reflect: true}) disabled = false;

  @property({type: Boolean, attribute: 'trailingicon'}) trailingIcon = false;

  @property({type: Boolean, reflect: true}) fullwidth = false;

  @property({type: String}) icon = '';

  @property({type: String}) label = '';

  @property({type: Boolean}) expandContent = false;

  @query('#button') buttonElement!: HTMLElement;

  @queryAsync('mwc-ripple') ripple!: Promise<Ripple|null>;

  @internalProperty() protected shouldRenderRipple = false;

  protected rippleHandlers = new RippleHandlers(() => {
    this.shouldRenderRipple = true;
    return this.ripple;
  });

  /** @soyTemplate */
  protected renderRipple() {
    const filled = this.raised || this.unelevated;
    return this.shouldRenderRipple ?
        html`<mwc-ripple .primary="${!filled}" .disabled="${
            this.disabled}"></mwc-ripple>` :
        '';
  }

  protected createRenderRoot() {
    return this.attachShadow({mode: 'open', delegatesFocus: true});
  }

  focus() {
    const buttonElement = this.buttonElement;
    if (buttonElement) {
      this.rippleHandlers.startFocus();
      buttonElement.focus();
    }
  }

  blur() {
    const buttonElement = this.buttonElement;
    if (buttonElement) {
      this.rippleHandlers.endFocus();
      buttonElement.blur();
    }
  }

  /** @soyTemplate */
  protected getRenderClasses() {
    return classMap({
      'mdc-button--raised': this.raised,
      'mdc-button--unelevated': this.unelevated,
      'mdc-button--outlined': this.outlined,
      'mdc-button--dense': this.dense,
    });
  }

  /** @soyTemplate */
  protected render() {
    return html`
      <button
          id="button"
          class="mdc-button ${this.getRenderClasses()}"
          ?disabled="${this.disabled}"
          aria-label="${this.label || this.icon}"
          @focus="${this.handleRippleFocus}"
          @blur="${this.handleRippleBlur}"
          @mousedown="${this.handleRippleActivate}"
          @mouseenter="${this.handleRippleMouseEnter}"
          @mouseleave="${this.handleRippleMouseLeave}"
          @touchstart="${this.handleRippleActivate}"
          @touchend="${this.handleRippleDeactivate}"
          @touchcancel="${this.handleRippleDeactivate}">
        ${this.renderRipple()}
        <span class="leading-icon">
          <slot name="icon">
            ${this.icon && !this.trailingIcon ? this.renderIcon() : ''}
          </slot>
        </span>
        <span class="mdc-button__label">${this.label}</span>
        <span class="slot-container ${classMap({
      flex: this.expandContent
    })}">
          <slot></slot>
        </span>
        <span class="trailing-icon">
          <slot name="trailingIcon">
            ${this.icon && this.trailingIcon ? this.renderIcon() : ''}
          </slot>
        </span>
      </button>`;
  }

  /** @soyTemplate */
  protected renderIcon() {
    return html`
    <mwc-icon class="mdc-button__icon">
      ${this.icon}
    </mwc-icon>`;
  }

  @eventOptions({passive: true})
  private handleRippleActivate(evt?: Event) {
    const onUp = () => {
      window.removeEventListener('mouseup', onUp);

      this.handleRippleDeactivate();
    };

    window.addEventListener('mouseup', onUp);
    this.rippleHandlers.startPress(evt);
  }

  private handleRippleDeactivate() {
    this.rippleHandlers.endPress();
  }

  private handleRippleMouseEnter() {
    this.rippleHandlers.startHover();
  }

  private handleRippleMouseLeave() {
    this.rippleHandlers.endHover();
  }

  private handleRippleFocus() {
    this.rippleHandlers.startFocus();
  }

  private handleRippleBlur() {
    this.rippleHandlers.endFocus();
  }
}