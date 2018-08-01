import * as React from 'react';
import { Image, Text, View } from 'react-native';
import { HostContext } from '../../../Contexts/HostContext';
import { HostRenderer } from '../../../HostRenderer/HostRenderer';
import { StyleManager } from '../../../Styles/StyleManager';
import { ImageUtils } from '../../../Utils/ImageUtils';
import { FlexBox } from './FlexBox';
export class ImageBlock extends React.Component {
    constructor(props) {
        super(props);
        this.renderPlaceholder = () => {
            if (!this.state.loaded) {
                return (React.createElement(View, { style: [
                        {
                            alignItems: 'center',
                            justifyContent: 'center'
                        }
                    ] },
                    React.createElement(Text, { style: {
                            fontSize: 32,
                            color: 'rgba(0, 0, 0, 0.5)',
                            textAlign: 'center'
                        } }, '\uE601')));
            }
            return undefined;
        };
        this.fetchImageSize = () => {
            ImageUtils.fetchSize(this.props.url, this.onImageSize, this.onImageSizeError);
        };
        this.onLayoutChange = () => {
            this.fetchImageSize();
        };
        this.onImageSizeUpdate = (event) => {
            let width = event.nativeEvent.layout.width;
            let height = event.nativeEvent.layout.height;
            if (this.props.onImageSize) {
                this.props.onImageSize(width, height);
            }
        };
        this.onImageSize = (width, height) => {
            console.log(width);
            console.log(height);
            let size = ImageUtils.calcSize({ width: width, height: height }, { width: this.props.containerWidth, height: this.props.containerHeight }, this.props.size, this.props.fitAxis);
            this.setState(size);
        };
        this.onImageSizeError = (err) => {
            console.log(err);
            console.log(this.props.url);
            this.setState({
                loaded: false
            });
        };
        this.onImageLoad = () => {
            this.setState({
                loaded: true
            });
            this.fetchImageSize();
        };
        this.onImageError = () => {
            this.setState({
                loaded: false
            });
        };
        this.state = {
            loaded: true,
            width: undefined,
            height: undefined,
        };
    }
    render() {
        const { url, boxStyle, alignSelf, onPress, size, } = this.props;
        if (url && (url.startsWith('data:image/svg+xml') || url.endsWith('.svg'))) {
            let svgRenderer = HostContext.getInstance().getHostRenderer(HostRenderer.SVG);
            let svgSize = typeof size === 'number' ?
                size : StyleManager.getInstance().getImageSize('large');
            if (svgRenderer) {
                return (React.createElement(FlexBox, Object.assign({}, this.props, { style: [
                        boxStyle,
                        {
                            alignSelf: alignSelf,
                        }
                    ], onPress: onPress, size: 'auto' }), svgRenderer(decodeURIComponent(url), svgSize, svgSize)));
            }
            else {
                return undefined;
            }
        }
        else {
            return (React.createElement(FlexBox, Object.assign({}, this.props, { style: [
                    boxStyle,
                    {
                        alignSelf: alignSelf,
                    }
                ], onLayoutChange: this.onLayoutChange, onPress: onPress, size: 'auto' }),
                this.renderPlaceholder(),
                this.renderImage()));
        }
    }
    renderImage() {
        return (React.createElement(Image, { accessible: !!this.props.alt, accessibilityLabel: this.props.alt, source: { uri: this.props.url }, style: [
                this.size,
                this.props.imgStyle
            ], onLoad: this.onImageLoad, onError: this.onImageError, onLayout: this.onImageSizeUpdate }));
    }
    get size() {
        return ImageUtils.fitSize(this.state, { width: this.props.maxWidth, height: this.props.maxHeight }, { width: this.props.maxWidth, height: this.props.maxHeight }, this.props.fitAxis);
    }
}