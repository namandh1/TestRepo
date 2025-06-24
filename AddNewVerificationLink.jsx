import { CopyOutlined, QuestionCircleFilled } from '@ant-design/icons';
import { Button, Col, Drawer, Input, Row, Tooltip } from "antd";
import _get from "lodash/get";
import React, { useEffect, useState, useCallback } from "react";
import { withAlert } from 'react-alert';
import { connect } from "react-redux";
import CommonSelect from "../../../Global/UIComponents/CommonSelect";
import genericGetData from "../../../Redux/Actions/genericGetData";
import genericPostData from "../../../Redux/Actions/genericPostData";

function AddNewVerificationLink(props) {

	const [businessClients, setBusinessClients] = useState([]);
	const [funds, setFunds] = useState([]);
	const [selectedFunds, setSelectedFunds] = useState([]);
	let [isRta, setIsRta] = useState(0);
	const [verificationLink, setVerificationLink] = useState('');
	const [comment, setComment] = useState('');
	const { open, setOpen } = props;

	const onClose = () => {
		// Reset form when closing
		setBusinessClients([]);
		setFunds([]);
		setSelectedFunds([]);
		setVerificationLink('');
		setIsRta(0);
		setOpen(false);
	};

	const saveAndGenerateLink = () => {
		// Validations to check businessClient and fund
		if (businessClients.length === 0) {
			props.alert.error('Please select business client');
			return;
		}
		else if (funds.length === 0) {
			props.alert.error('Please select fund');
			return;
		}

		// Prepare request object
		let reqObj = {
			businessClientId: businessClients.toString(),
			fundId: funds.length ? funds.toString() : null,
			modifiedBy: window.sessionStorage.getItem("loginName")
		};
		//console.log("requestobj: ", reqObj)

		// API call to generate verification link
		genericPostData({

			dispatch: props.dispatch,
			url: `api/walletverificationapi/GenerateFundWalletVerificationLink`,
			reqObj,
			dontShowMessage: true,

			successCb: (data) => {
				// API returns the generated verification link
				if (data && Array.isArray(data.data) && data.data.length > 0 && data.data[0].verificationLink) {
					const tempLink = "https://portal.navfundservices/wallet-verifcation/" + data.data[0].verificationLink
					setVerificationLink(tempLink);
					props.alert.success('Verification link generated successfully');
				}
			},

			errorCb: (err) => {
				//console.error('Error generating verification link', err);
				props.alert.error(err.message || 'Failed to generate verification link');
			}
		});
	}

	var getBusinessClients = () => {
		
		genericGetData({

			dispatch: props.dispatch,
			url: "api/walletverificationapi/GetBusinessClients",
			identifier: "GET_BUSINESS_CLIENTS",
			dontshowmessage: true,

			successCb: () => { },

			errorCb: (err) => {
				if (err.status == 403)
					props.history.push("/AccessDenied")
			}
		})
	}

	var setFundsFilterList = (businessClientIDs) => {

		const queryParam = businessClientIDs === null ? '' : businessClientIDs;

		genericGetData({

			dispatch: props.dispatch,
			url: `api/walletverificationapi/GetFunds?businessClientIDs=${queryParam}`,
			dontshowmessage: true,

			successCb: (data) => {
				setSelectedFunds(data.data)
			},

			errorCb: (err) => {
				if (err.status == 403)
					props.history.push("/AccessDenied")
			}
		})
	}

	var getVerificationLink = (fundId) => {

		// API call to get verification link for selected fund
		genericGetData({

			dispatch: props.dispatch,
			url: `api/walletverificationapi/GetFundWalletVerificationLink?fundID=${fundId.toString()}`,
			dontShowMessage: true,

			successCb: (data) => {
				// API returns the generated verification link
				if (data && Array.isArray(data.data) && data.data.length > 0 && data.data[0].verificationLink) {
					const tempLink = "https://portal.navfundservices/wallet-verifcation/" + data.data[0].verificationLink
					setVerificationLink(tempLink);
					console.log("verification link is ", data.data)
					props.alert.success('Verification link already generated');
				}
			},

			errorCb: (err) => {
				if (err.status == 403)
					props.history.push("/AccessDenied")
			}
		});
	}

	var onChangeBusinessClientFilter = (value) => {

		if (value && Array.isArray(value) && value.length) {
			setFundsFilterList(value);
		}
		else {
			setSelectedFunds([]);
		}
		setBusinessClients(value);
		setFunds([]);
		setVerificationLink('');
	}

	var onChangeFundFilter = (value) => {
		console.log("value is: ", value)
		setVerificationLink('');
		setFunds(value);
		// value is fundId, find the value of isRTA of this fundId
		for (let i = 0; i < selectedFunds.length; i++) {
			if (selectedFunds[i].fundId === value) {
				isRta = selectedFunds[i].isRTAFund
			}
		}
		getVerificationLink(value);
	}

	// Function to copy verification link to clipboard
	const copyToClipboard = () => {
		if (verificationLink) {
			navigator.clipboard.writeText(verificationLink)
			.then(() => {
				props.alert.success('Verification link copied to clipboard');
			})
			.catch(err => {
				props.alert.error('Failed to copy to clipboard');
			});
		}
	};

	useEffect(() => {
		getBusinessClients();
	}, []);

	return (
		<>
			<Drawer
				title={
					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
						<span style={{ color: 'white' }}> Generate Verification Link </span>
						<Tooltip title="No review is required for new verification link.">
							<QuestionCircleFilled style={{ color: 'white', fontSize: '16px', cursor: 'pointer' }} />
						</Tooltip>
					</div>
				}
				width="25%"
				onClose={onClose}
				open={open}
				placement="right"
				visible={open}
				headerStyle={{
					paddingTop: '40px',  // Add extra padding at the top
					height: 'auto',
					backgroundColor: '#005A9C',
					borderBottom: '1px solid #e8e8e8',
					zIndex: 1000
				}}
				style={{
					marginTop: '40px'  // Add margin to the entire drawer
				}}
				closable={false}
			>
				{/* BusinessClients Filter */}
				<div>
					<div>
						<div style={{ fontWeight:'bold', marginBottom: '10px' }}>Select Client</div>
					</div>
					<div>
						<CommonSelect
							placeholder='Clients'
							value={businessClients}
							data={props.businessClientList}
							dataKey={"businessClientRelationshipID"}
							dataLabel={"businessClientRelationshipReportingName"}
							onChange={onChangeBusinessClientFilter}
							maxTagCount={"responsive"}
							defaultValue='None Selected'
							width='100%'
							style={{ marginBottom: '20px' }}
						/>
					</div>
				</div>

				{/* Funds Filter */}
				<div>
					<div>
						<div>
							<div style={{ fontWeight: 'bold', marginBottom: '10px' }}>Select Funds</div>
						</div>
						<div>
							<CommonSelect
								placeholder='Funds'
								value={funds}
								data={selectedFunds}
								dataKey={"id"}
								dataLabel={"name"}
								onChange={onChangeFundFilter}
								maxTagCount={"responsive"}
								defaultValue='None Selected'
								style={{ marginBottom: '20px' }}
							/>
						</div>
					</div>
				</div>

				{/* RTA message*/}
				{isRta===1 && (
					<div style={{ fontStyle: 'italic', color: '#888', marginBottom: '10px' }}>
						This is a RTA fund.
					</div>
				)}

				{/* Comment Input */}
				<div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Comments</div>
				<Input.TextArea
					rows={3}
					placeholder="Enter your comments here..."
					value={comment}
					onChange={(e) => setComment(e.target.value)}
					style={{ marginBottom: '20px' }}
				/>

				{/* Verification Link Display */}
				<div>
					<div style={{ fontWeight: 'bold', marginBottom: '10px' }} >Generated Verification Link</div>
					<div style={{ display: 'flex', alignItems: 'center' }}>
						<Input
							type="text"
							value={verificationLink}
							readOnly
							placeholder="Generated link will appear here"
							style={{ marginRight: '8px' }}
							suffix={<Tooltip title="Copy to clipboard">
								<CopyOutlined
									onClick={copyToClipboard}
									style={{ cursor: 'pointer', fontSize: '18px' }}
								/>
							</Tooltip>}
						/>
					</div>
				</div>

				<Row className="mt-3">
					<Col lg={3}>
						{/* Close Button */}
						<Button
							label='Close'
							onClick={onClose}
						>
							Close
						</Button>
					</Col>
					<Col lg={10}> </Col>
					<Col lg={3}>
						{/* Save and Generate Button */}
						<Button
							type="primary"
							label='Save and Generate Link'
							onClick={saveAndGenerateLink}
							style={{ backgroundColor: "#005A9C", color: "#ffffff" }}
							disabled={businessClients.length === 0 || funds.length == 0 || verificationLink != ''}
						> Save and Generate Link
						</Button>
					</Col>
				</Row>
			</Drawer>
		</>
	);
}

function mapStateToProps(state) {
	let businessClientList = _get(state, "businessClientList.data.data", []);
	return { businessClientList }
}

export default connect(mapStateToProps)(withAlert()(AddNewVerificationLink));
