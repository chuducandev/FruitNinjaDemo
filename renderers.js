import React, { useEffect, useRef, useState } from "react";
import {
	Dimensions,
	Animated,
	Image,
	View,
	Text,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const Box = (props) => {
	const width = props.size[0];
	const height = props.size[1];
	const x = props.body.position.x - width / 2;
	const y = props.body.position.y - height / 2;
	const angle = props.body.angle;
	const image = props.image;
	const id = props.id;

	return (
		<Animated.View
			style={{
				position: "absolute",
				left: x,
				top: y,
				width: width,
				height: height,
				transform: [{ rotate: angle + "rad" }],
			}}
		>
			<View
				style={{
					position: "absolute",
					width: width,
					height: height / 2,
					top: id % 2 == 0 ? 0 : height / 2 - 1,
					overflow: "hidden",
				}}
			>
				<Image
					source={image}
					style={{
						width: width,
						height: height,
						marginTop: id % 2 == 0 ? 0 : -height / 2,
					}}
				/>
			</View>
		</Animated.View>
	);
};

const ComboText = (props) => {
	const numOfCombo = props.numOfCombo;
	const color = props.color;
	const x = props.x;
	const y = props.y;
	const opacity = props.opacity;

	const [posX, setPosX] = useState(-1000);
	const [posY, setPosY] = useState(-1000);
	const [angle, setAngle] = useState(0);

	useEffect(() => {
		setPosX(x);
		setPosY(y);
		// setAngle(Math.random() * Math.PI / 4 - Math.PI / 8);
	}, [x, y]);

	return (
		<View
			style={{
				position: "absolute",
				left: posX,
				top: posY,
				width: width,
				alignItems: "center",
				opacity: opacity,
			}}
		>
			<Text
				style={{
					fontSize: numOfCombo == -1 ? 36 : 14 + numOfCombo * 2,
					fontWeight: "bold",
					color: color,
					textAlign: "center",
				}}
			>
				{numOfCombo == -1 ? "Star Time!" : numOfCombo == 1 ? "Nice" : numOfCombo == 2 ? "Double\nkill" : numOfCombo == 3 ? "Triple kill" : numOfCombo == 4 ? "Quadra kill" : numOfCombo == 5 ? "Penta kill" : numOfCombo == 6 ? "Ultra kill" : numOfCombo == 7 ? "Godlike" : numOfCombo == 8 ? "Rampage" : numOfCombo == 9 ? "Unstoppable" : numOfCombo == 10 ? "Wicked sick" : "Unbelievable"}
			</Text>
		</View>

	)
}

const Splash = (props) => {
	const width = props.width;
	const height = props.height;
	const x = props.position.x - width / 2;
	const y = props.position.y - height / 2;
	const opacity = props.opacity;
	const image = props.image;
	const angle = props.angle;
	const color = props.color;

	return (
		<Image
			source={image}
			style={{
				position: "absolute",
				left: x,
				top: y,
				width: width,
				height: height,
				opacity: opacity,
				transform: [{ rotate: angle + "rad" }],
				tintColor: color,
			}}
		/>
	)
}

export { Box, ComboText, Splash };