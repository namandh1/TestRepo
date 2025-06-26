{
    field: 'walletAddress',
    headerName: 'Wallet Address',
    initialWidth: 350,
    headerTooltip: 'Wallet Address',
    cellRenderer: (params) => {
        const hasAdditionalFunds = params.data.hasAdditionalFunds;
        
        const handleIconClick = () => {
            if (!hasAdditionalFunds) return;
            
            // Fetch and show modal data
            genericGetData({
                dispatch: props.dispatch,
                url: `api/walletverificationapi/GetAdditionalFundsForWalletConfiguration?walletAddress=${params.data.walletAddress}&fundId=${row.fundID}`,
                successCb: (data) => {
                    if (data && data.data && data.data.length > 0) {
                        const filteredData = data.data.map(item => ({
                            businessClientRelationshipReportingName: item.businessClientRelationshipReportingName,
                            clientName: item.clientName
                        }));
                        setModalData(filteredData);
                        setCurrentWalletAddress(params.data.walletAddress);
                        setModalLoading(false);
                        setModalVisible(true);
                    }
                },
                errorCb: (err) => {
                    props.alert.error('Failed to fetch additional funds data');
                }
            });
        };

        const getTooltip = () => {
            return hasAdditionalFunds 
                ? 'View additional funds for this wallet' 
                : 'No additional funds available for this wallet';
        };

        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                height: '100%',
                padding: '0 8px'
            }}>
                <span style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                    marginRight: '8px'
                }}>
                    {params.data.walletAddress}
                </span>
                <Tooltip title={getTooltip()}>
                    <ExportOutlined
                        style={{
                            color: hasAdditionalFunds ? '#1890ff' : '#d9d9d9',
                            cursor: hasAdditionalFunds ? 'pointer' : 'not-allowed',
                            fontSize: '14px',
                            flexShrink: 0
                        }}
                        onClick={handleIconClick}
                    />
                </Tooltip>
            </div>
        );
    },
    cellStyle: {
        padding: 0,
        display: 'flex',
        alignItems: 'center'
    }
}
