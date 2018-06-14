import React from 'react';
import {
    FlexAlignType,
    Image,
    LayoutChangeEvent,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { ImageElement } from '../../Schema/CardElements/Image';
import {
    FlexImageAlignment,
    HorizontalAlignment,
    ImageSize,
    ImageStyle,
} from '../../Shared/Enums';
import { CardElementWrapper } from '../Base/CardElementWrapper';
import { ICardElementViewProps } from '../Shared/BaseProps';
import { styleManager } from '../Styles/StyleManager';

const IMAGEMINSIZE = 18;
const enum ImageFit {
    FlexibleWidth,
    FlexibleHeight
}

interface IProps extends ICardElementViewProps<ImageElement> {
}

interface IState {
    viewWidth: number;
    viewHeight: number;
    imageAspectRatio: number;
    imageLoadSuccess: boolean;
}

export class ImageView extends React.PureComponent<IProps, IState> {
    private isComponentUnmounted: Boolean;
    private fitStyle?: ImageFit;

    constructor(props: IProps) {
        super(props);

        this.state = {
            viewWidth: 0,
            viewHeight: 0,
            imageAspectRatio: 1,
            imageLoadSuccess: true,
        };
    }

    componentWillUnmount() {
        this.isComponentUnmounted = true;
    }

    render(): JSX.Element {
        const { element, index } = this.props;

        if (!element || !element.isValid()) {
            return null;
        }

        const dimensions = element.isFixedSize() ?
            {
                width: styleManager.getImageSize(element.size),
                height: styleManager.getImageSize(element.size),
            } :
            this.getDimensionsForBestFit();
        const borderRadius = element.style === ImageStyle.Person && dimensions ?
            dimensions.width / 2 :
            undefined;

        return (
            <CardElementWrapper
                element={element}
                index={index}
                style={
                    styleManager.isHorizontalImageSet() ? undefined : { flex: 1 }
                }
            >
                <View
                    style={{ flex: 1 }}
                    onLayout={this.onLayout}
                >
                    {
                        this.state.imageLoadSuccess ?
                            undefined :
                            this.renderPlaceholder()
                    }
                    <Image
                        accessible={!!element.altText}
                        accessibilityLabel={element.altText || undefined}
                        style={{
                            overflow: 'hidden',
                            width: dimensions ? dimensions.width : undefined,
                            height: dimensions ? dimensions.height : undefined,
                            alignSelf: this.getImageAlignment(element.horizontalAlignment, element.size),
                            borderRadius: borderRadius
                        }}
                        source={{ uri: element.url }}
                        onLoad={this.onLoad}
                        onError={this.onError}
                        resizeMode={'cover'}
                        resizeMethod={'auto'}
                    />
                </View>
            </CardElementWrapper>
        );
    }

    private renderPlaceholder() {
        return (
            <View
                style={[
                    StyleSheet.absoluteFill,
                    {
                        alignItems: 'center',
                        justifyContent: 'center'
                    }
                ]}
            >
                <Text
                    style={{
                        fontSize: 32,
                        color: 'rgba(0, 0, 0, 0.5)',
                        textAlign: 'center'
                    }}
                >
                    {'\uE601'}
                </Text>
            </View>);
    }

    private onLayout = (event?: LayoutChangeEvent) => {
        const { element } = this.props;

        if (element.isFixedSize()) {
            return;
        }

        let width = event.nativeEvent.layout.width;
        let height = event.nativeEvent.layout.height;

        console.log('AdaptiveCard Image onLayout', width, height);
        if (!this.fitStyle) {
            this.fitStyle = width !== 0 && height === 0 ? ImageFit.FlexibleHeight : ImageFit.FlexibleWidth;
        }
        this.setState({
            viewWidth: width,
            viewHeight: height
        });
    }

    private onLoad = () => {
        const { element } = this.props;

        Image.getSize(element.url, (width: number, height: number) => {

            console.log('AdaptiveCard Image getSize', width, height);

            if (!this.isComponentUnmounted && width) {
                this.setState({
                    imageAspectRatio: height / width
                });
            }
        }, (error: any) => {
            // TODO:
            console.error('failed to get image size of commute url, error');
        });
    }

    private onError = () => {
        if (!this.isComponentUnmounted) {
            this.setState({
                imageLoadSuccess: false,
            });
        }
    }

    // TODO: Dimension types | undefined
    private getDimensionsForBestFit = () => {
        if (this.state.imageAspectRatio) {
            switch (this.fitStyle) {
                case ImageFit.FlexibleHeight:
                    if (this.state.viewWidth) {
                        return {
                            height: Math.floor(this.state.viewWidth * this.state.imageAspectRatio),
                            width: this.state.viewWidth
                        };
                    }
                    break;
                case ImageFit.FlexibleWidth:
                    if (this.state.viewHeight) {
                        let dimensions = {
                            width: Math.floor(this.state.viewHeight / this.state.imageAspectRatio),
                            height: this.state.viewHeight
                        };
                        if (this.state.viewWidth && dimensions.width > this.state.viewWidth) {
                            dimensions.width = this.state.viewWidth;
                        }
                        return dimensions;
                    }
                    break;
            }
        } else if (this.fitStyle !== undefined) {
            return {
                width: this.state.viewWidth || IMAGEMINSIZE,
                height: this.state.viewHeight || IMAGEMINSIZE
            };
        }

        return undefined;
    }

    private getImageAlignment(alignment: HorizontalAlignment, imageSize: ImageSize) {
        let imageAlignment: string;

        if (imageSize === ImageSize.Stretch) {
            imageAlignment = FlexImageAlignment.Stretch;
        } else {
            switch (alignment) {
                case HorizontalAlignment.Left:
                    imageAlignment = FlexImageAlignment.FlexStart;
                    break;
                case HorizontalAlignment.Right:
                    imageAlignment = FlexImageAlignment.FlexEnd;
                    break;
                case HorizontalAlignment.Center:
                default:
                    imageAlignment = FlexImageAlignment.Center;
                    break;
            }
        }

        return imageAlignment as FlexAlignType;
    }
}