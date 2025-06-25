const fetchAdditionalFunds = (walletAddress) => {
	if (!walletAddress) return;
	
	setAdditionalFundsLoading(true);
	setSelectedWalletAddress(walletAddress);
	
	genericGetData({
		dispatch: props.dispatch,
		url: `api/walletverificationapi/GetAdditionalFundsForWalletConfiguration?walletAddress=${walletAddress}&fundId=${row.fundID}`,
		successCb: (data) => {
			const fundsData = data.data || [];
			setAdditionalFundsData(fundsData);
			
			// Update the set of wallet addresses with no funds
			if (fundsData.length === 0) {
				setWalletAddressesWithNoFunds(prev => new Set([...prev, walletAddress]));
			} else {
				// Remove from no-funds set if data exists
				setWalletAddressesWithNoFunds(prev => {
					const newSet = new Set(prev);
					newSet.delete(walletAddress);
					return newSet;
				});
				setAdditionalFundsModal(true);
			}
			setAdditionalFundsLoading(false);
		},
		errorCb: (err) => {
			props.alert.error('Failed to fetch additional funds data');
			setAdditionalFundsLoading(false);
		}
	});
};


const checkAdditionalFunds = (walletAddress) => {
	if (!walletAddress || walletAddress.trim().length === 0) return;
	
	// Don't check again if we already know this address has no funds
	if (walletAddressesWithNoFunds.has(walletAddress)) return;
	
	genericGetData({
		dispatch: props.dispatch,
		url: `api/walletverificationapi/GetAdditionalFundsForWalletConfiguration?walletAddress=${walletAddress}&fundId=${row.fundID}`,
		dontshowmessage: true,
		successCb: (data) => {
			const fundsData = data.data || [];
			if (fundsData.length === 0) {
				setWalletAddressesWithNoFunds(prev => new Set([...prev, walletAddress]));
			} else {
				setWalletAddressesWithNoFunds(prev => {
					const newSet = new Set(prev);
					newSet.delete(walletAddress);
					return newSet;
				});
			}
		},
		errorCb: (err) => {
			// Silently handle error for background check
			console.error('Failed to check additional funds:', err);
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
			// Check for additional funds when user finishes editing
			if (inputValue && inputValue.trim().length > 0) {
				checkAdditionalFunds(inputValue.trim());
			}
		};

		// Check if wallet address exists and is valid for showing the icon
		const showIcon = inputValue && inputValue.trim().length > 0;
		const hasNoFunds = walletAddressesWithNoFunds.has(inputValue?.trim());
		const isIconDisabled = hasNoFunds;

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
					<Tooltip title={isIconDisabled ? "No additional funds found for this wallet address" : "Additional Funds for Wallet Address"}>
						<Button
							type="text"
							size="small"
							icon={<ExportOutlined style={{ fontSize: '16px', color: isIconDisabled ? '#d9d9d9' : undefined }} />}
							onClick={() => !isIconDisabled && fetchAdditionalFunds(inputValue)}
							loading={additionalFundsLoading && selectedWalletAddress === inputValue}
							disabled={isIconDisabled}
							style={{ padding: '4px' }}
						/>
					</Tooltip>
				)}
			</div>
		);
	}
},



const onClose = () => {
	setVerificationLinkStatus(null);
	setRowData(null);
	setOriginalConfigData(null);
	setFundComments('')
	setOriginalFundComments('');
	setAdditionalFundsModal(false);
	setAdditionalFundsData([]);
	setSelectedWalletAddress('');
	setWalletAddressesWithNoFunds(new Set()); // Add this line
	setOpen(false);
};
