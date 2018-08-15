import * as React from 'react';
import { NumberInput } from '../../Components/Inputs/NumberInput';
import { FormContext } from '../../Contexts/FormContext';
import { HostContext } from '../../Contexts/HostContext';
import { StyleManager } from '../../Styles/StyleManager';
import { NumberUtils } from '../../Utils/NumberUtils';
export class NumberInputView extends React.Component {
    constructor(props) {
        super(props);
        this.onBlur = () => {
            console.log('NumberInputView onBlur');
            this.setState({
                focused: false,
            }, () => {
                let callback = HostContext.getInstance().getHandler('blur');
                if (callback) {
                    callback();
                }
            });
        };
        this.onFocus = () => {
            console.log('NumberInputView onFocus');
            this.setState({
                focused: true,
            }, () => {
                let callback = HostContext.getInstance().getHandler('focus');
                if (callback) {
                    callback();
                }
            });
        };
        this.onValueChange = (value) => {
            this.setState({
                value: value
            }, this.updateStore);
        };
        this.onValidate = (input) => {
            if (this.props.element) {
                return this.props.element.validate(input);
            }
            return true;
        };
        const { element } = this.props;
        if (element && element.isValid) {
            let defaultValue = this.props.element.value;
            if (defaultValue === undefined) {
                defaultValue = '';
            }
            if (NumberUtils.isNumber(this.props.element.value.toString())) {
                this.state = {
                    value: this.props.element.value.toString(),
                    focused: false,
                };
                this.updateStore();
            }
        }
    }
    render() {
        const { element } = this.props;
        if (!element || !element.isValid) {
            return null;
        }
        return (React.createElement(NumberInput, { color: this.color, backgroundColor: this.backgroundColor, borderColor: this.borderColor, borderRadius: 4, borderWidth: 1, fontSize: this.fontSize, fontWeight: this.fontWeight, placeholder: element.placeholder, value: this.state.value, onValueChange: this.onValueChange, onBlur: this.onBlur, onFocus: this.onFocus, validateInput: this.onValidate, marginTop: this.spacing, paddingLeft: this.paddingHorizontal, paddingRight: this.paddingHorizontal, paddingTop: this.paddingVertical, paddingBottom: this.paddingVertical }));
    }
    updateStore() {
        FormContext.getInstance().updateField(this.props.element.id, this.state.value, this.props.element.validate(this.state.value));
    }
    get fontSize() {
        return StyleManager.getFontSize('default');
    }
    get fontWeight() {
        return StyleManager.getFontWeight('default');
    }
    get paddingVertical() {
        return 12;
    }
    get paddingHorizontal() {
        return 12;
    }
    get color() {
        if (this.state.focused) {
            return StyleManager.getInputFocusColor(this.props.theme);
        }
        else {
            return StyleManager.getInputColor(this.props.theme);
        }
    }
    get backgroundColor() {
        if (this.state.focused) {
            return StyleManager.getInputFocusBackgroundColor(this.props.theme);
        }
        else {
            return StyleManager.getInputBackgroundColor(this.props.theme);
        }
    }
    get borderColor() {
        if (this.state.focused) {
            return StyleManager.getInputFocusBorderColor(this.props.theme);
        }
        else {
            return StyleManager.getInputBorderColor(this.props.theme);
        }
    }
    get spacing() {
        if (this.props.index !== undefined && this.props.index > 0) {
            return StyleManager.getSpacing(this.props.element.spacing);
        }
        return 0;
    }
}
