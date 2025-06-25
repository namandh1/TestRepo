const [additionalFundsModal, setAdditionalFundsModal] = useState(false);
const [additionalFundsData, setAdditionalFundsData] = useState([]);
const [additionalFundsLoading, setAdditionalFundsLoading] = useState(false);
const [selectedWalletAddress, setSelectedWalletAddress] = useState('');


const fetchAdditionalFunds = (walletAddress) => {
	if (!walletAddress) return;
	
	setAdditionalFundsLoading(true);
	setSelectedWalletAddress(walletAddress);
	
	genericGetData({
		dispatch: props.dispatch,
		url: `api/walletverificationapi/GetAdditionalFundsForWalletConfiguration?walletAddress=${walletAddress}&fundId=${row.fundID}`,
		successCb: (data) => {
			setAdditionalFundsData(data.data || []);
			setAdditionalFundsModal(true);
			setAdditionalFundsLoading(false);
		},
		errorCb: (err) => {
			props.alert.error('Failed to fetch additional funds data');
			setAdditionalFundsLoading(false);
		}
	});
};




{
	field: 'walletAddress',
	headerName: 'Wallet Address',
	initialWidth: 390,
	headerTooltip: 'Wallet Address',
	cellRenderer: (params) => {
		// Determine if wallet address should be disabled
		const isDisabled = !isCellEditable(params.data, 'walletAddress');

		// Create a ref to maintain focus
		const inputRef = React.useRef(null);

		// Keep track of local state for the input value
		const [inputValue, setInputValue] = React.useState(params.value);

		// Handle local changes without triggering grid refresh
		const handleLocalChange = (e) => {
			setInputValue(e.target.value);
		};

		// Only update the actual data when the input loses focus
		const handleBlur = () => {
			handleCellEdit(params.data, 'walletAddress', inputValue);
		};

		// Check if wallet address exists and is valid for showing the icon
		const showIcon = inputValue && inputValue.trim().length > 0;

		return (
			<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
				<Input
					ref={inputRef}
					type="text"
					value={inputValue}
					onChange={handleLocalChange}
					onBlur={handleBlur}
					disabled={isDisabled}
					style={{
						flex: 1,
						...(params.data.action === 'U' && params.data.status === 2 ? { height: '20px' } : {})
					}}
					status={failedRegexConfig.includes(params.data.configurationID) ? "error" : null}
					allowClear={true}
				/>
				{showIcon && (
					<Tooltip title="Additional Funds for Wallet Address">
						<Button
							type="text"
							size="small"
							icon={<ExportOutlined style={{ fontSize: '16px' }} />}
							onClick={() => fetchAdditionalFunds(inputValue)}
							loading={additionalFundsLoading && selectedWalletAddress === inputValue}
							style={{ padding: '4px' }}
						/>
					</Tooltip>
				)}
			</div>
		);
	}
},




{/* Additional Funds Modal */}
<Modal
	title={`Additional Funds for Wallet Address: ${selectedWalletAddress}`}
	open={additionalFundsModal}
	onCancel={() => setAdditionalFundsModal(false)}
	footer={[
		<Button key="close" onClick={() => setAdditionalFundsModal(false)}>
			Close
		</Button>
	]}
	width={600}
>
	<Table
		dataSource={additionalFundsData}
		loading={additionalFundsLoading}
		pagination={false}
		size="small"
		locale={{
			emptyText: 'No additional funds found for this wallet address'
		}}
		columns={[
			{
				title: 'Business Client Name',
				dataIndex: 'businessClientName',
				key: 'businessClientName',
				width: '50%'
			},
			{
				title: 'Fund Name',
				dataIndex: 'fundName',
				key: 'fundName',
				width: '50%'
			}
		]}
		rowKey={(record, index) => index}
	/>
</Modal>




const onClose = () => {
	setVerificationLinkStatus(null);
	setRowData(null);
	setOriginalConfigData(null);
	setFundComments('')
	setOriginalFundComments('');
	// Add these new lines:
	setAdditionalFundsModal(false);
	setAdditionalFundsData([]);
	setSelectedWalletAddress('');
	setOpen(false);
};


