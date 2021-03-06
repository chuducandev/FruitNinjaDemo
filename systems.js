import { Box, Splash } from "./renderers";
import { starInterval } from "./constants";
import Matter from "matter-js";
import {
	Bomb,
	Fruits,
	Splashes,
	Star,
} from "./constants";

let boxIds = -1;
let splashIds = -1;

const distance = ([x1, y1], [x2, y2]) =>
	Math.sqrt(Math.abs(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)));

const Physics = (state, { touches, time }) => {
	let engine = state["physics"].engine;

	Matter.Engine.update(engine, time.delta);

	return state;
};

const difficulty = seconds => {
	if (seconds < 5) return 0;
	if (seconds < 15) return 0.1;
	if (seconds < 30) return 0.2;
	if (seconds < 60) return 0.3;
	if (seconds < 120) return 0.4;
	return 0.5;
}

const CreateBox = (state, { touches, screen, time }) => {
	const world = state["physics"].world;
	const constraints = state["physics"].constraints;
	const startingTime = state["global"].startingTime;
	const followingTime = state["global"].followingTime;
	const endingTime = state["global"].endingTime;
	const starTime = state["global"].starTime;
	const currentTime = (new Date()).getTime();
	const timeInterval = currentTime - starTime < starInterval
		? Math.random() * 400 + 100
		: (currentTime - startingTime < starInterval
			? Math.random() * 500 + 1000
			: (Math.random() < 0.7 ? Math.random() * 400 + 100 : Math.random() * 500 + 1500));

	if (currentTime > followingTime && currentTime <= endingTime) {
		const numBoxes = 1// Math.random() < 0.7 ? 1 : Math.floor(Math.random() * 3) + 2;

		for (let i = 0; i < numBoxes; i++) {
			state["global"].followingTime += timeInterval;

			const p = Math.random();
			const fruit = p < difficulty((currentTime - startingTime) / 1000) && currentTime > starTime + starInterval
				? Bomb
				: p > 0.9 && currentTime > starTime + starInterval && starTime < startingTime
					? Star
					: Fruits[Math.floor(Math.random() * Fruits.length)];

			const width = fruit.width * fruit.scale * 0.07;
			const height = fruit.height * fruit.scale * 0.07;

			const x = Math.random() * screen.width * 0.8 + screen.width * 0.1;
			const y = screen.height * 1.5;

			const force = {
				x: (x > screen.width / 2
					? Math.floor(Math.random() * screen.height * 0.075) - screen.height * 0.075
					: Math.floor(Math.random() * screen.height * 0.075)) / numBoxes * (fruit == Star ? 1.3 : 1),
				y: (Math.floor(Math.random() * screen.height * 0.03) - screen.height * 2) / numBoxes * (fruit == Star ? 1.3 : 1),
			}
			const torque = Math.floor(Math.random() * 2) == 0
				? Math.floor(Math.random() * 100) - 1000
				: Math.floor(Math.random() * 100) + 1900;

			let body1 = Matter.Bodies.rectangle(
				x,
				y,
				width,
				height,
				{
					density: fruit != Bomb ? 1 : 0.6,
					force,
					torque,
					collisionFilter: {
						group: -1,
					},
					fruit,
				}
			);
			let body2 = Matter.Bodies.rectangle(
				x,
				y,
				width,
				height,
				{
					density: fruit != Bomb ? 1 : 0.6,
					torque,
					collisionFilter: {
						group: -1,
					},
					fruit,
				}
			);

			const constraint = Matter.Constraint.create({
				bodyA: body1,
				bodyB: body2,
				isBomb: fruit == Bomb,
				isStar: fruit == Star,
			});

			Matter.World.add(world, [body1, body2]);
			Matter.World.addConstraint(world, constraint);

			constraints.push(constraint);
			state[++boxIds] = {
				id: boxIds,
				body: body1,
				size: [width, height],
				color: fruit.splashColor,
				image: fruit.image,
				renderer: Box,
				isBomb: fruit == Bomb,
				isStar: fruit == Star,
			};
			state[++boxIds] = {
				id: boxIds,
				body: body2,
				size: [width, height],
				color: fruit.splashColor,
				image: fruit.image,
				renderer: Box,
				isBomb: fruit == Bomb,
				isStar: fruit == Star,
			};
		}
	}


	return state;
};

const MoveBox = (state, { touches, screen }) => {
	const constraints = state["physics"].constraints;
	const setScore = state["global"].setScore;
	const setScoreColor = state["global"].setScoreColor;
	const setComboTextParams = state["global"].setComboTextParams;
	const boxSize = Math.trunc(Math.max(screen.width, screen.height) * 0.075);

	const move = touches.find(x => x.type === "move");

	if (move) {
		const movePos = [move.event.pageX, move.event.pageY];
		const selectedConstraints = constraints.filter(constraint => {
			const bodyA = constraint.bodyA;
			const bodyB = constraint.bodyB;

			return (
				bodyA && bodyB && (
					distance([bodyA.position.x, bodyA.position.y], movePos) < boxSize ||
					distance([bodyB.position.x, bodyB.position.y], movePos) < boxSize)
			);
		});

		selectedConstraints.forEach(constraint => {
			const currentTime = (new Date()).getTime();
			const currentCombo = state["global"].currentCombo;
			const previousSliceTime = state["global"].previousSliceTime;
			state["global"].previousSliceTime = currentTime;

			if (constraint.isBomb) {
				state["global"].explode();
				state["global"].endingTime = (new Date()).getTime();
				return;
			}

			if (constraint.isStar) {
				state["global"].starTime = (new Date()).getTime();
				state["global"].endingTime = Math.max(state["global"].endingTime, (new Date()).getTime() + starInterval);
				setComboTextParams({
					numOfCombo: -1,
					color: "#f3cc30",
					x: 0,
					y: screen.height / 2 - 18,
					opacity: 1,
					startingTime: currentTime,
				});
				return;
			}

			const splash = Splashes[Math.floor(Math.random() * Splashes.length)];
			state["splash" + (++splashIds).toString()] = {
				id: "splash" + splashIds.toString(),
				width: splash.width * splash.scale * 0.1,
				height: splash.height * splash.scale * 0.1,
				position: {
					x: constraint.bodyA.position.x,
					y: constraint.bodyA.position.y,
				},
				color: constraint.bodyA.fruit.splashColor,
				image: splash.image,
				renderer: Splash,
				startingTime: currentTime,
				angle: Math.random() * 360,
				opacity: 1,
			}

			if (currentTime - previousSliceTime > 500) {
				setScore(score => score + 1);
				setScoreColor(constraint.bodyA.fruit.splashColor);
				state["global"].currentCombo = 1;
			} else {
				setScore(score => score + 2);
				setScoreColor(constraint.bodyA.fruit.splashColor);
				setComboTextParams({
					numOfCombo: currentCombo + 1,
					color: constraint.bodyA.fruit.splashColor,
					x: (constraint.bodyA.position.x + constraint.bodyB.position.x) / 2 - screen.width / 2,
					y: (constraint.bodyA.position.y + constraint.bodyB.position.y) / 2 - screen.height / 10,
					opacity: 1,
					startingTime: currentTime,
				})
				state["global"].currentCombo++;
			}


			if (Math.floor(Math.random() * 2) == 0) {
				constraint.bodyA.force = {
					x: -70,
					y: -200,
				}
				constraint.bodyB.force = {
					x: 70,
					y: 0,
				}
			} else {
				constraint.bodyA.force = {
					x: 70,
					y: -200,
				}
				constraint.bodyB.force = {
					x: -70,
					y: 0,
				}
			}

			constraint.bodyA = null;
			constraint.bodyB = null;
		});
	}

	return state;
};

const CleanBoxes = (state, { touches, screen }) => {
	let world = state["physics"].world;

	Object.keys(state)
		.filter(key => {
			if (state[key].isStar)
				return state[key].body.position.y < -state[key].size[1];
			else
				return state[key].body && (state[key].body.position.y > screen.height * 1.5 || state[key].body.speed > 100)
		})
		.forEach(key => {
			if (state[key].body.speed > 100) isRemoved = true;
			Matter.Composite.remove(world, state[key].body);
			delete state[key];
		});

	return state;
};

const ControlComboTextOpacity = (state, { touches, screen }) => {
	const setComboTextParams = state["global"].setComboTextParams;
	const currentTime = (new Date()).getTime();

	setComboTextParams(state => {
		return {
			...state,
			opacity: currentTime < state.startingTime + 700 ? 1 : Math.max(state.startingTime + 1200 - currentTime, 0) / 1000,
		}
	});

	return state;
}

const ControlSplashOpacity = (state, { touches, screen }) => {
	const currentTime = (new Date()).getTime();

	Object.keys(state)
		.filter(key => state[key].renderer === Splash)
		.forEach(key => {
			console.log(state[key].startingTime, currentTime, currentTime - state[key].startingTime)
			if (state[key].startingTime + 1200 > currentTime) {
				state[key] = {
					...state[key],
					opacity: currentTime < state[key].startingTime + 700 ? 1 : Math.max(state[key].startingTime + 1200 - currentTime, 0) / 1000,
				}
			} else {
				delete state[key];
			}
		});

	return state;
}

const RestartGame = (state, { touches, screen }) => {
	const currentTime = (new Date()).getTime();

	if (currentTime > state["global"].endingTime + 5000) {
		if (touches.find(x => x.type == "press")) {
			state["global"].startingTime = currentTime;
			state["global"].followingTime = currentTime;
			state["global"].endingTime = currentTime + 180000;
			state["global"].setScore(0);
			state["global"].currentCombo = 1;
			state["global"].previousSliceTime = currentTime;
			state["global"].setComboTextParams({
				numOfCombo: 1,
				color: "transparent",
				x: screen.width / 2 - screen.width / 6,
				y: screen.height / 2 - screen.height / 10,
				opacity: 0,
				startingTime: currentTime,
			});

			Object.keys(state)
				.filter(key => state[key].renderer === Box)
				.forEach(key => {
					delete state[key];
				})
		}
	}
	return state;
}

export { Physics, CreateBox, MoveBox, CleanBoxes, ControlComboTextOpacity, ControlSplashOpacity, RestartGame };
