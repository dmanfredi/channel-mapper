import React, { useState, useRef, useEffect } from 'react';
import './App.less';

const PHYSICAL = 'Physical';
const VIRTUAL = 'Virtual';

const Arrow = ({
	calculateArrowLength,
	calculateArrowAngle,
	getDotPosition,
	mousePosition,
	channel,
	channelMappedTo,
	selected,
}) => {
	let startX, startY, endX, endY;

	if (selected) {
		startX = getDotPosition(channel, 'physical').x;
		startY = getDotPosition(channel, 'physical').y;
		endX = mousePosition.x;
		endY = mousePosition.y;
	} else {
		if (channelMappedTo === null) return null;

		startX = getDotPosition(channel, 'physical').x;
		startY = getDotPosition(channel, 'physical').y;
		endX = getDotPosition(channelMappedTo, 'virutal').x;
		endY = getDotPosition(channelMappedTo, 'virutal').y;
	}

	return (
		<div
			className="arrow-proper physical"
			style={{
				width: `${calculateArrowLength(startX, startY, endX, endY)}px`,
				transform: `rotate(${calculateArrowAngle(
					startX,
					startY,
					endX,
					endY
				)}deg)`,
			}}
		>
			<div className="arrow-body"></div>
			<div className="arrow-head"></div>
		</div>
	);
};

const App = () => {
	const channels = [1, 2, 3, 4];
	const [selectedChannel, setSelectedChannel] = useState(null);
	const [channelType, setChannelType] = useState('true');
	const [channelMap, setChannelMap] = useState({ 1: 1, 2: 2, 3: 3, 4: 4 });
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
	const arrowContainerRef = useRef(null);
	const dotRefs = useRef({});

	useEffect(() => {
		console.log('Channel Mappings:', channelMap);
	}, [channelMap]);

	const handleChannelClick = (channel, channelType) => {
		setSelectedChannel(channel);
		setChannelType(channelType);

		if (selectedChannel !== null && channelType !== PHYSICAL) {
			setChannelMap((prevMap) => {
				const newMap = { ...prevMap };

				if (channelType === PHYSICAL) {
					newMap[channel] = selectedChannel;
				} else {
					// Remove existing mappings to the virtual channel
					for (let physChannel in newMap) {
						if (newMap[physChannel] === channel) {
							newMap[physChannel] = null;
						}
					}
					newMap[selectedChannel] = channel;
				}
				return newMap;
			});
		}
	};

	const isSelected = (channel, physical) => {
		return (
			channel === selectedChannel &&
			(channelType === PHYSICAL) === physical
		);
	};

	const handleMouseMove = (event) => {
		if (arrowContainerRef.current) {
			const rect = arrowContainerRef.current.getBoundingClientRect();
			setMousePosition({
				x: event.clientX - rect.left,
				y: event.clientY - rect.top,
			});
		}
	};

	const handleMouseLeave = () => {
		// setMousePosition({ x: 0, y: 0 });
	};

	const calculateArrowAngle = (startX, startY, endX, endY) => {
		const dx = endX - startX;
		const dy = endY - startY;
		return Math.atan2(dy, dx) * (180 / Math.PI);
	};

	const calculateArrowLength = (startX, startY, endX, endY) => {
		const dx = endX - startX;
		const dy = endY - startY;
		return Math.sqrt(dx * dx + dy * dy);
	};

	const getDotPosition = (channel, type) => {
		const dotElement = dotRefs.current[`${type}-${channel}`];
		if (dotElement) {
			const rect = dotElement.getBoundingClientRect();
			const containerRect =
				arrowContainerRef.current.getBoundingClientRect();
			return {
				x: rect.left + rect.width / 2 - containerRect.left,
				y: rect.top + rect.height / 2 - containerRect.top,
			};
		}
		return { x: 0, y: 0 };
	};

	return (
		<div className="App">
			<div className="switcher-menu">
				<div className="physical-container channel-container">
					{channels.map((channel) => (
						<div
							key={`physical-${channel}`}
							className={`physical-channel channel ${
								isSelected(channel, true) ? 'selected' : ''
							}`}
							onClick={() =>
								handleChannelClick(channel, PHYSICAL)
							}
						>
							<div className="channel-and-dot">
								{channel}
								<div
									className="dot physical"
									ref={(el) =>
										(dotRefs.current[
											`physical-${channel}`
										] = el)
									}
								></div>
								{isSelected(channel, true) ? (
									<Arrow
										calculateArrowLength={
											calculateArrowLength
										}
										calculateArrowAngle={
											calculateArrowAngle
										}
										getDotPosition={getDotPosition}
										mousePosition={mousePosition}
										channel={channel}
										selected={true}
									/>
								) : (
									<Arrow
										calculateArrowLength={
											calculateArrowLength
										}
										calculateArrowAngle={
											calculateArrowAngle
										}
										getDotPosition={getDotPosition}
										mousePosition={mousePosition}
										channel={channel}
										channelMappedTo={channelMap[channel]}
										selected={false}
									/>
								)}
							</div>
						</div>
					))}
				</div>
				<div
					className="arrows-container"
					ref={arrowContainerRef}
					onMouseMove={handleMouseMove}
					onMouseLeave={handleMouseLeave}
				></div>
				<div className="virtual-container channel-container">
					{channels.map((channel) => (
						<div
							key={`virtual-${channel}`}
							className={`virtual-channel channel ${
								isSelected(channel, false) ? 'selected' : ''
							}`}
							onClick={() => handleChannelClick(channel, VIRTUAL)}
						>
							<div className="channel-and-dot">
								<div
									className="dot virtual"
									ref={(el) =>
										(dotRefs.current[`virutal-${channel}`] =
											el)
									}
								></div>
								{channel}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default App;
