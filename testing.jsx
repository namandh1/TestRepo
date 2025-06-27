// Alternative solution: Force blur any active cell before executing undo
var handleActionStatus = (data) => {
	// Hide delete button for rows with status = 2 (Approved)
	const showDeleteButton = data.data.status !== 2 || (data.data.status == 2 && data.data.action !== null && data.data.action !== 'U');
	const showUndoButton = (showDeleteButton) || data.data.configStatus == 'deleted' || data.data.configStatus == 'edited'
	
	const handleUndoMouseDown = (e) => {
		e.preventDefault();
		e.stopPropagation();
		
		// Force blur any active input in the grid
		if (gridApi) {
			// Stop any current editing
			gridApi.stopEditing();
			// Force focus away from any input elements
			const activeElement = document.activeElement;
			if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
				activeElement.blur();
			}
		}
		
		// Execute undo after ensuring no input is focused
		setTimeout(() => {
			onClickUndoButton(data);
		}, 0);
	};

	const handleDeleteMouseDown = (e) => {
		e.preventDefault();
		e.stopPropagation();
		
		// Force blur any active input in the grid
		if (gridApi) {
			gridApi.stopEditing();
			const activeElement = document.activeElement;
			if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
				activeElement.blur();
			}
		}
		
		setTimeout(() => {
			onClickDeleteButton(data);
		}, 0);
	};

	console.log("in handleactionstatus: ", data);
	return (
		<Space>
			{/* Undo button */}
			{showUndoButton &&
				<Tooltip title={"Undo"}>
					<Button
						type="text"
						size="small"
						icon={<UndoOutlined style={{ fontSize: '17px', marginRight: "3px" }} />}
						onMouseDown={handleUndoMouseDown}
					/>
				</Tooltip>}
			{/* Delete button */}
			{showDeleteButton && (
				<Tooltip title={"Delete"}>
					<Button
						type="text"
						size="small"
						icon={<DeleteOutlined style={{ fontSize: '17px' }} />}
						onMouseDown={handleDeleteMouseDown}
					/>
				</Tooltip>
			)}
		</Space>
	);
};
