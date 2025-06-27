// Solution: Combine onMouseDown with preventDefault and stopPropagation
var handleActionStatus = (data) => {
	// Hide delete button for rows with status = 2 (Approved)
	const showDeleteButton = data.data.status !== 2 || (data.data.status == 2 && data.data.action !== null && data.data.action !== 'U');
	const showUndoButton = (showDeleteButton) || data.data.configStatus == 'deleted' || data.data.configStatus == 'edited'
	
	const handleUndoMouseDown = (e) => {
		e.preventDefault();
		e.stopPropagation();
		onClickUndoButton(data);
	};

	const handleDeleteMouseDown = (e) => {
		e.preventDefault();
		e.stopPropagation();
		onClickDeleteButton(data);
	};

	// Also prevent the onClick event to avoid any double-firing
	const preventClick = (e) => {
		e.preventDefault();
		e.stopPropagation();
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
						onClick={preventClick}
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
						onClick={preventClick}
					/>
				</Tooltip>
			)}
		</Space>
	);
};
