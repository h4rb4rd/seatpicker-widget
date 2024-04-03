import { useCallback, useMemo, useRef, useState } from 'react'
import { Stage, Layer, Circle, Image, Text, Group } from 'react-konva'
import { Vector2d } from 'konva/lib/types'
import useImage from 'use-image'

import stageIcon from '../../assets/Greek_theater.svg'

import cls from './Canvas.module.scss'

const CANVAS_WIDTH = 1000
const CANVAS_HEIGHT = 500
const CIRCLE_RADIUS = 10

type PopupData = {
	seat: string
	position: { x: number; y: number }
}

const generatePlaces = () => {
	return [...Array(10)].map((_, i) => ({
		id: i.toString(),
		x: Math.random() * CANVAS_WIDTH,
		y: Math.random() * CANVAS_HEIGHT,
		isSelected: false,
	}))
}

const INITIAL_STATE = generatePlaces()

export const Canvas = () => {
	const [places, setPlaces] = useState(INITIAL_STATE)
	const [scale, setScale] = useState(1)
	const [popup, setPopup] = useState<PopupData | null>(null)
	const popupRef = useRef<HTMLDivElement | null>(null)
	const [image] = useImage(stageIcon)

	const zoomIn = useCallback(() => {
		setScale(1.5)
	}, [])

	const zoomOut = useCallback(() => {
		setScale(1)
	}, [])

	const getDragPosition = useCallback(
		(pos: Vector2d) => {
			pos.x = Math.min(
				(CANVAS_WIDTH * scale) / 2,
				Math.max(pos.x, (-CANVAS_WIDTH * scale) / 2)
			)
			pos.y = Math.min(
				(CANVAS_HEIGHT * scale) / 2,
				Math.max(pos.y, (-CANVAS_HEIGHT * scale) / 2)
			)

			return pos
		},
		[scale]
	)

	const handleSeatHover = useCallback((data: PopupData | null) => {
		setPopup(data)
	}, [])

	const handleClick = useCallback(
		(id: string) => () => {
			setPlaces(
				places.map(circle => {
					if (circle.id === id) {
						return {
							...circle,
							isSelected: !circle.isSelected,
						}
					}
					return circle
				})
			)

			if (popup) {
				handleSeatHover(null)
			}
		},
		[places, popup, handleSeatHover]
	)

	const selectedPlaces = useMemo(
		() =>
			places.map(place => {
				if (place.isSelected) {
					return (
						<div className={cls.place} key={place.id}>
							place {place.id}
						</div>
					)
				} else {
					return null
				}
			}),
		[places]
	)

	const memoPlaces = useMemo(
		() =>
			places.map(place => {
				const { id, x, y, isSelected } = place
				if (isSelected) {
					return (
						<Group
							key={id}
							x={x}
							y={y}
							onClick={handleClick(id)}
							onMouseEnter={e => {
								const container = e.target.getStage()?.container()
								if (container) container.style.cursor = 'pointer'
							}}
							onMouseLeave={e => {
								const container = e.target.getStage()?.container()
								if (container) container.style.cursor = ''
							}}
						>
							<Circle
								fill={'white'}
								stroke={'blue'}
								radius={CIRCLE_RADIUS * 1.5}
							/>
							<Text align='center' text={id} offsetX={4} offsetY={5} />
						</Group>
					)
				} else {
					return (
						<Circle
							key={id}
							x={x}
							y={y}
							fill={'blue'}
							radius={10}
							onClick={handleClick(id)}
							onMouseEnter={e => {
								const container = e.target.getStage()?.container()
								if (container) container.style.cursor = 'pointer'

								e.target._clearCache()
								handleSeatHover({
									seat: id,
									position: e.target.getAbsolutePosition(),
								})
							}}
							onMouseLeave={e => {
								const container = e.target.getStage()?.container()
								if (container) container.style.cursor = ''

								handleSeatHover(null)
							}}
						/>
					)
				}
			}),
		[places, handleClick, handleSeatHover]
	)

	return (
		<div className={cls.wrapper}>
			<div className={cls.widget}>
				<Stage
					className={cls.stage}
					width={CANVAS_WIDTH * scale}
					height={CANVAS_HEIGHT * scale}
					draggable
					dragBoundFunc={getDragPosition}
					scaleX={scale}
					scaleY={scale}
				>
					<Layer>
						<Image
							image={image}
							x={CANVAS_WIDTH / 2}
							y={CANVAS_HEIGHT / 2}
							offsetX={image ? image.width / 2 : 0}
							offsetY={image ? image.height / 2 : 0}
						/>
						{memoPlaces}
					</Layer>
				</Stage>
				<div className={cls.zoom}>
					<button className={cls.btn} onClick={zoomIn} disabled={scale === 1.5}>
						+
					</button>
					<button className={cls.btn} onClick={zoomOut} disabled={scale === 1}>
						-
					</button>
				</div>
				<div className={cls.places}>{selectedPlaces}</div>
				{popup && (
					<div
						ref={popupRef}
						style={{
							position: 'absolute',
							top: popup.position.y - 70 + 'px',
							left: popup.position.x - 92 + 'px',
							padding: '10px',
							borderRadius: '3px',
							boxShadow: '0 0 5px grey',
							zIndex: 10,
							backgroundColor: 'white',
						}}
					>
						<div>Seat {popup.seat}</div>
						<div>Click on the seat to select</div>
					</div>
				)}
			</div>
		</div>
	)
}
