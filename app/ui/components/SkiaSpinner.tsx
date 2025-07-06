import {Canvas, Group, Path, Skia} from "@shopify/react-native-skia";
import React, {useEffect, useMemo} from "react";
import {View} from "react-native";
import {useSharedValue, withRepeat, withTiming} from "react-native-reanimated";

const SIZE = 48;
const STROKE_WIDTH = 6;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CENTER = SIZE / 2;
const ARC_LENGTH = Math.PI * 1.5;
const ARC_START = -Math.PI / 2;

export const SkiaSpinner = () => {
	const rotation = useSharedValue(0);

	useEffect(() => {
		rotation.value = withRepeat(withTiming(1, {duration: 1200}), -1, false);
	}, [rotation]);

	const [skiaRotation, setSkiaRotation] = React.useState(0);
	useEffect(() => {
		let mounted = true;
		function update() {
			if (!mounted) return;
			setSkiaRotation(rotation.value * 2 * Math.PI);
			requestAnimationFrame(update);
		}
		update();
		return () => {
			mounted = false;
		};
	}, [rotation]);

	const arcPath = useMemo(() => {
		const path = Skia.Path.Make();
		path.addArc(
			{
				x: CENTER - RADIUS,
				y: CENTER - RADIUS,
				width: RADIUS * 2,
				height: RADIUS * 2,
			},
			(ARC_START * 180) / Math.PI,
			(ARC_LENGTH * 180) / Math.PI,
		);
		return path;
	}, []);

	return (
		<View
			style={{
				width: SIZE,
				height: SIZE,
				justifyContent: "center",
				alignItems: "center",
			}}
		>
			<Canvas style={{width: SIZE, height: SIZE}}>
				<Group
					origin={{x: CENTER, y: CENTER}}
					transform={[{rotate: skiaRotation}]}
				>
					<Path
						path={arcPath}
						style="stroke"
						strokeWidth={STROKE_WIDTH}
						strokeCap="round"
						color="#A4343A"
					/>
				</Group>
			</Canvas>
		</View>
	);
};
