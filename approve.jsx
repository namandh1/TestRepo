import { CopyOutlined, QuestionCircleFilled } from '@ant-design/icons';
import { AgGridReact } from 'ag-grid-react';
import { Button, Checkbox, Drawer, Input, message, Switch, Tooltip } from "antd";
import _get from "lodash/get";
import moment from 'moment';
import React, { useEffect, useMemo, useState } from "react";
import { withAlert } from 'react-alert';
import { connect } from "react-redux";
import { Label } from "reactstrap";
import genericGetData from "../../../Redux/Actions/genericGetData";
import genericPostData from "../../../Redux/Actions/genericPostData";


function ApproveWalletConfiguration(props) {
	const { open, setOpen, row } = props;
	const [rowData, setRowData] = useState([]);
	const [verificationLinkStatus, setVerificationLinkStatus] = useState(false);
	const [linkStatusCheckbox, setLinkStatusCheckbox] = useState(false);
	const [selectedRows, setSelectedRows] = useState([]);
	const [showLinkCheckbox, setShowLinkCheckbox] = useState(false);
	const [linkData, setLinkData] = useState(null);
	
	const onClose = () => {
		setShowLinkCheckbox(false);
		setOpen(false);
	};

	const fetchVerificationLinkStatus = () => {
		genericGetData({
			dispatch: props.dispatch,
			url: `api/walletverificationapi/GetFundWalletVerificationLinkStatus?fundId=${row.fundID}`,
			successCb: (data) => {
				setVerificationLinkStatus(data.data[0].isActive);
				setLinkData(data.data[0]);
				if (data.data[0].status == 3) {
					setShowLinkCheckbox(true)
				}
				else {
					setShowLinkCheckbox(false)
				}
			},
			errorCb: (err) => {
				props.alert.error('Failed to fetch verificationLinkStatus');
			}
		});
	};

	// to set the verification link status
	useEffect(() => {
		if (open) {
			fetchVerificationLinkStatus();
		}
	}, [open, row]);

	const handleWalletOperation = (operation) => {
		if (selectedRows.length === 0 && linkStatusCheckbox === false) {
			props.alert.error("Please select at least one configuration to " + operation.toLowerCase());
			return;
		}

		// Get comma-separated list of configuration IDs from selected rows
		const configurationIDs = selectedRows
			.map(row => row.configurationID)
			.join(',');

		const linkApproval = linkStatusCheckbox ? "1" : "0";

		genericPostData({
			dispatch: props.dispatch,
			url: 'api/walletverificationapi/SetFundWalletsConfigurationApproval',
			reqObj: {
				fundID: row.fundID,
				linkApproval: linkApproval,
				fundWalletConfigurationIDs: configurationIDs,
				operation: operation,
				modifiedBy: window.sessionStorage.getItem("loginName")
			},
			successCb: (response) => {
				props.alert.success(`Configurations ${operation.toLowerCase()}d successfully`);
				// Reload configurations
				fetchVerificationLinkStatus();
				getWalletConfigurationData();
				setSelectedRows([]);
			},
			errorCb: (err) => {
				props.alert.error(`Failed to ${operation.toLowerCase()} configurations: ` + (err.message || 'Unknown error'));
			}
		});
	};

	const onGridReady = (params) => {
		params.api.sizeColumnsToFit();
	};

	const getWalletConfigurationData = () => {

		genericGetData({
			dispatch: props.dispatch,
			url: `api/walletverificationapi/GetFundWalletConfiguration?fundIds=${row.fundID}`,
			successCb: (data) => {
				if (data && data.data) {
					const dataWithSelection = data.data.map(item => ({
						...item,
						currencySymbol: item.currencySymbol ? item.currencySymbol : "All",
						selected: false
					}));
					setRowData(dataWithSelection);

				} else {
					setRowData([]);
				}
			},
			errorCb: (err) => {
				console.error("Failed to load existing configurations:", err);
				props.alert.error('Failed to load existing configurations');
			}
		});
	}

	const copyToClipboard = (text) => {
		navigator.clipboard.writeText(text).then(
			() => {
				message.success("Copied to clipboard");
			},
			(err) => {
				message.error("Failed to copy text");
				console.error("Could not copy text: ", err);
			}
		);
	};

	// Check if link can be approved by current user
	const canApproveLink = () => {
		if (!linkData) return false;

		// Already approved
		if (linkData.status == 2) return false;

		// Same user check
		const currentUser = window.sessionStorage.getItem("loginName").toLowerCase();
		return !(linkData.versionSource && linkData.versionSource.toLowerCase() === currentUser);
	};

	// Get tooltip for link checkbox
	const getLinkCheckboxTooltip = () => {
		if (!linkData) return "";

		if (linkData.status == 2) {
			return "Already approved.";
		}

		const currentUser = window.sessionStorage.getItem("loginName").toLowerCase();
		if (linkData.versionSource && linkData.versionSource.toLowerCase() === currentUser) {
			return "User cannot approve their own added/ updated changes.";
		}

		return "";
	};

	// Reset the component when the drawer opens
	useEffect(() => {
		if (open) {
			setSelectedRows([]);
			getWalletConfigurationData();
		}
	}, [open, row]);

	// Column definitions for Ag Grid
	const columns = [
		{
			field: 'select',
			headerName: '',
			width: 52,
			cellRenderer: (params) => {
				console.log("params: ", params);
				if (params.data && params.data.status === 2 && params.data.action === 'U') {
					return null; // Return null to render nothing
				}
				const isSelectable = params.data &&
					params.data.status === 3 &&
					params.data.versionSource.toLowerCase() !== window.sessionStorage.getItem("loginName").toLowerCase();
				const alreadyApproved = params.data &&
					params.data.status === 2
				return (
					<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
						{isSelectable ? (
							<input
								type="checkbox"
								onChange={(e) => {
									const checked = e.target.checked;
									params.node.setSelected(checked);
								}}
								checked={params.node.isSelected()}
							/>
						) : alreadyApproved ? (
							<Tooltip title="Already approved.">
								<span>
									<input
										type="checkbox"
										disabled
										style={{ cursor: 'not-allowed' }}
									/>
								</span>
							</Tooltip>
						) : (
							<Tooltip title="User cannot approve their own added/ updated changes.">
								<span>
									<input
										type="checkbox"
										disabled
										style={{ cursor: 'not-allowed' }}
									/>
								</span>
							</Tooltip>
						)}
					</div>
				);
			},
			headerCheckboxSelection: (params) => {
				//Only enable header checkbox if at least one row has status=3
				if (params.api && params.api.getModel()) {
					const rowNodes = params.api.getModel().rootNode.childrenAfterFilter;
					return rowNodes.some(node => node.data && node.data.status === 3 && node.data.versionSource.toLowerCase() !== window.sessionStorage.getItem("loginName").toLowerCase());
				}
				//if (params.api && params.api.getModel()) {
				//    const rowNodes = params.api.getModel().rootNode.childrenAfterFilter;
				//    return rowNodes.some(node => node.data && node.data.status === 3);
				//}
				return false;
			},
			headerCheckboxSelectionFilteredOnly: true,
			suppressSizeToFit: true,
			pinned: 'left',
			lockPosition: true,
			suppressMovable: true,
		},
		{
			field: 'chainName',
			headerName: 'Blockchain',
			initialWidth: 110,
			headerTooltip: 'Blockchain'
		},
		{
			field: 'currencySymbol',
			headerName: 'Currency',
			initialWidth: 90,
			headerTooltip: 'Currency'
		},
		{
			field: 'walletAddress',
			headerName: 'Wallet Address',
			initialWidth: 350,
			headerTooltip: 'Wallet Address'
		},
		{
			field: 'isActive',
			headerName: 'Is Active',
			initialWidth: 100,
			cellStyle: {
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				height: '100%'
			},
			cellRenderer: (params) => {
				return <Checkbox checked={params.data.isActive === 1} disabled />;
			},
			headerTooltip: 'Is Active'
		},
		{
			field: 'modifiedBy',
			headerName: 'Modified Date and By',
			initialWidth: 190,
			valueGetter: p => {
				return p.data.versionSource ? moment(p.data.versionDate).format("MM-DD-YY hh:mm") + '; ' + p.data.versionSource : '';
			},
			headerTooltip: 'Modified Date and By'
		},
		{
			field: 'approvedBy',
			headerName: 'Approved Date and By',
			initialWidth: 190,
			valueGetter: p => {
				return p.data.approvedBy ? moment(p.data.approvedDate).format("MM-DD-YY hh:mm") + '; ' + p.data.approvedBy : '';
			},
			headerTooltip: 'Approved Date and By'
		}
	];

	// Default properties of columns
	const defaultColDef = useMemo(() => ({
		editable: false,
		sortable: true,
		filter: true,
		resizable: true,
		suppressMovable: true,
		lockPosition: true,
		flex: 0,
		suppressSizeToFit: true,
		maintainColumnWidths: true,
		suppressMenu: true
	}), []);

	// Row style for different statuses
	const getRowStyle = (params) => {
		let backgroundColor = null, fontStyle = null;

		if (params && params.data) {
			if (params.data.status === 3) {
				if (params.data.action === "U") {
					backgroundColor = "#DBE9FA"; // blue
				} else if (params.data.action === "I") {
					backgroundColor = "#AFE1AF"; // green
				}
			} else if (params.data.status === 2) {
				if (params.data.action === "U") {
					backgroundColor = "#D3D3D3"; // gray
					fontStyle = "italic";
				}
			}
		}

		return {
			backgroundColor: backgroundColor,
			fontStyle: fontStyle,
		};
	};

	// height setting for sub grid
	const getDetailRowHeight = (params) => {
		if (params && params.data) {
			if (params.data.status === 2 && params.data.action === "U") {
				return 20;
			}
		}
		return null;
	};

	return (
		<>
			<Drawer
				title={
					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
						<span style={{ color: 'white' }}> Approve Wallet Configurations </span>
						<Tooltip title="User cannot approve their own added/ updated changes.">
							<QuestionCircleFilled style={{ color: 'white', fontSize: '16px', cursor: 'pointer' }} />
						</Tooltip>
					</div>
				}
				width="50%"
				onClose={onClose}
				open={open}
				placement="right"
				headerStyle={{
					paddingTop: '40px',
					height: 'auto',
					backgroundColor: '#005A9C',
					borderBottom: '1px solid #e8e8e8',
					zIndex: 1000
				}}
				style={{
					marginTop: '40px'
				}}
				closable={false}
			>
				<div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0px 16px 16px 16px' }}>

					{/* BusinessClients and Funds Filter */}
					<div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
						<div style={{ flex: 1 }}>
							<Label htmlFor="clients" style={{ marginBottom: '10px' }}>Client</Label>
							<Tooltip title={row && row.businessClientName ? row.businessClientName : ''}>
								<Input
									placeholder='Client'
									value={row && row.businessClientName ? row.businessClientName : ''}
									style={{ width: '100%' }}
									readOnly
								/>
							</Tooltip>
						</div>

						<div style={{ flex: 1 }}>
							<Label htmlFor="funds" style={{ marginBottom: '10px' }}>Fund</Label>
							<Tooltip title={row && row.fundName ? row.fundName : ''}>
								<Input
									placeholder='Fund'
									value={row && row.fundName ? row.fundName : ''}
									style={{ width: '100%' }}
									readOnly
								/>
							</Tooltip>
						</div>
					</div>

					{/* Verification Link Display and status switch */}
					<div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
						<div style={{ flex: 3 }}>
							<Label htmlFor="verification-link">Verification Link</Label>
							<div style={{ display: 'flex' }}>
								<Tooltip title={row && row.verificationLink ? row.verificationLink : ''}>
									<Input
										placeholder='Verification Link'
										value={row && row.verificationLink ? row.verificationLink : ''}
										style={{ width: '100%' }}
										readOnly
										suffix={<Button
											type="small"
											icon={<CopyOutlined />}
											onClick={() => copyToClipboard(row && row.verificationLink ? row.verificationLink : '')}
										/>}
									/>
								</Tooltip>
							</div>
						</div>
						<div style={{ flex: 1 }}>
							<Label htmlFor="verification-link-status">Link Status</Label>
							<div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '5px' }}>
								<Switch
									checked={verificationLinkStatus}
									disabled
									style={{ marginRight: '10px' }}
								/>
								<div style={{ display: 'flex', alignItems: 'center' }}>
									{getLinkCheckboxTooltip() ? (
										<Tooltip title={getLinkCheckboxTooltip()}>
											<span>
												<Checkbox
													checked={linkStatusCheckbox}
													onChange={(e) => setLinkStatusCheckbox(e.target.checked)}
													disabled={!canApproveLink()}
													style={{ cursor: canApproveLink() ? 'pointer' : 'not-allowed' }}
												/>
											</span>
										</Tooltip>
									) : (
										<Checkbox
											checked={linkStatusCheckbox}
											onChange={(e) => setLinkStatusCheckbox(e.target.checked)}
											disabled={!canApproveLink()}
											style={{ cursor: canApproveLink() ? 'pointer' : 'not-allowed' }}
										/>
									)}
									<span style={{ marginLeft: '8px' }}><strong>Approve Link Status</strong></span>
								</div>
							</div>
						</div>
					</div>

					{/* Table with 7 columns */}
					<div className="ag-theme-alpine rounded-grid" style={{ flexGrow: 1, width: '100%', height: '400px' }}>
						<AgGridReact
							rowData={rowData}
							onGridReady={onGridReady}
							columnDefs={columns}
							defaultColDef={defaultColDef}
							getRowStyle={getRowStyle}
							getRowHeight={getDetailRowHeight}
							rowSelection="multiple"
							suppressRowClickSelection={true}
							onSelectionChanged={(event) => {
								const selectedNodes = event.api.getSelectedNodes();
								const selectedData = selectedNodes.map(node => node.data);
								setSelectedRows(selectedData);
							}}
							suppressHorizontalScroll={false}
							suppressColumnVirtualisation={true}
							suppressRowVirtualisation={false}
						/>
					</div>

					{/* Close, Reject and Approve buttons */}
					<div style={{
						display: 'flex',
						justifyContent: 'flex-end',
						marginTop: 'auto',
						gap: '12px',
						padding: '16px',
						borderTop: '1px solid #eee'
					}}>
						<Button
							onClick={onClose}
						>
							Close
						</Button>

						<div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
							<Button
								type="primary"
								onClick={() => handleWalletOperation("Reject")}
								style={{ backgroundColor: "#d9534f", color: "#ffffff" }}
								disabled={selectedRows.length === 0 && (!canApproveLink() || !linkStatusCheckbox)}
							>
								Reject
							</Button>

							<Button
								type="primary"
								onClick={() => handleWalletOperation("Approve")}
								style={{ backgroundColor: "#005A9C", color: "#ffffff" }}
								disabled={selectedRows.length === 0 && (!canApproveLink() || !linkStatusCheckbox)}
							>
								Approve
							</Button>
						</div>
					</div>
				</div>
			</Drawer>
		</>
	);
}

function mapStateToProps(state) {
	let businessClientList = _get(state, "businessClientList.data.data", []);
	return { businessClientList };
}

export default connect(mapStateToProps)(withAlert()(ApproveWalletConfiguration));
