import ViewPager from '@react-native-community/viewpager';
import React, { ReactElement, RefObject, useCallback, useRef, useState } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';

interface CircularViewPagerRefProps {
    data: Array<string | number>;
    initialIndex?: number;
    renderItem: (item: string | number, index: number) => ReactElement;
    onPageSelected?: (index: number) => void;
    onPageScrollStateChanged?: (pageScrollState: string) => void;
    containerStyle?: ViewStyle;
}

interface Props extends CircularViewPagerRefProps {
    forwardRef?: React.Ref<ViewPager>;
}


function CircularViewPager(props: Props) {
    const vpRef: RefObject<ViewPager> = props.forwardRef ? props.forwardRef : useRef<ViewPager>(null);

    /* Current index of ViewPager */
    const [selectedIndex, setSelectedIndex] = useState(
        props.data !== null && props.data.length > 1 ? props.initialIndex : 0,
    );
    /* Data for circular ViewPager. adding last item at top and top data at last */
    const viewPagerData =
        props.data !== null && props.data.length > 1
            ? [props.data[props.data.length - 1], ...props.data, props.data[0]]
            : props.data;

    /* Callback for ViewPager `onPageSelected`. Update selectedIndex with current position of ViewPager */
    const onPageChanged = useCallback(
        ({ nativeEvent: { position } }) => {
            setSelectedIndex(position);
            if (viewPagerData.length > 1 && position !== viewPagerData.length - 1 && position !== 0) {
                props.onPageSelected && props.onPageSelected(position - 1);
            }
        },
        [viewPagerData],
    );

    /* Callback for ViewPager `onPageScrollStateChanged`.
    If state is `idle`, then if selectedIndex is 0 then set viewPager index to 1 without animation
    and if selectedIndex is viewPagerData.length - 1 then set viewPager index to viewPagerData.length - 2
    without animation
    */
    const handleScrollStateChange = useCallback(
        ({ nativeEvent: { pageScrollState } }) => {
            props.onPageScrollStateChanged && props.onPageScrollStateChanged(pageScrollState);
            if (pageScrollState === 'idle') {
                if (selectedIndex == 0) {
                    vpRef.current &&
                        vpRef.current.setPageWithoutAnimation(
                            viewPagerData.length - 2,
                        );
                } else if (selectedIndex == viewPagerData.length - 1) {
                    vpRef.current && vpRef.current.setPageWithoutAnimation(1);
                }
            }
        },
        [props.data, selectedIndex],
    );

    return (
        <ViewPager
            ref={vpRef}
            style={styles.root}
            initialPage={selectedIndex}
            onPageScrollStateChanged={handleScrollStateChange}
            onPageSelected={onPageChanged}
        >
            {viewPagerData != null
                ? viewPagerData.map((item, index) => props.renderItem(item, index))
                : null}
        </ViewPager>
    );
}



function CircularViewPagerRef(props: CircularViewPagerRefProps, ref?: React.Ref<ViewPager>): ReactElement {
    return <CircularViewPager forwardRef={ref} {...props} />;
}

const styles = StyleSheet.create({
    root: {
        flex: 1
    }
});

export default React.memo(React.forwardRef<ViewPager, CircularViewPagerRefProps>(CircularViewPagerRef));
