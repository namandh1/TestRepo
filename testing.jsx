{/* Scrollable top section */}
<div style={{ 
    flexShrink: 0, 
    maxHeight: '40vh', // Limit height to 40% of viewport
    overflowY: 'auto',
    paddingRight: '8px', // Add some padding for scrollbar
    marginBottom: '12px'
}}>
    {/* BusinessClients and Funds Filter */}
    <div style={{ display: 'flex', gap: '20px', marginBottom: '12px' }}>
        {/* ... existing content ... */}
    </div>

    {/* Verification Link Display and inactive/active verification link switch */}
    <div style={{ display: 'flex', gap: '20px', marginBottom: '10px' }}>
        {/* ... existing content ... */}
    </div>

    {/* Comments section */}
    <div style={{ marginBottom: '10px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Comments</div>
        <Input.TextArea
            value={fundComments}
            onChange={(e) => setFundComments(e.target.value)}
            rows={2}
            style={{ 
                width: '100%',
                minHeight: '60px', // Set minimum height
                maxHeight: '120px', // Set maximum height
                resize: 'vertical' // Allow only vertical resize
            }}
            allowClear={true}
        />
    </div>
</div>

{/* Add Configuration button */}
<div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px', flexShrink: 0 }}>
    {/* ... existing button ... */}
</div>

{/* Table container with fixed height */}
<div style={{ 
    flex: 1, 
    minHeight: '300px', // Minimum height for table
    position: 'relative',
    marginBottom: '12px'
}}>
    {loading && (
        {/* ... existing loading spinner ... */}
    )}

    <div className="ag-theme-alpine rounded-grid" style={{ 
        height: '100%', 
        width: '100%' 
    }}>
        {/* ... existing AgGridReact ... */}
    </div>
</div>

{/* Fixed footer */}
<div style={{
    flexShrink: 0,
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: '16px',
    borderTop: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb'
}}>
    {/* ... existing buttons ... */}
</div>






<Drawer
    // ... other props ...
    style={{
        marginTop: '40px'
    }}
    bodyStyle={{
        padding: 0, // Remove default padding since we're handling it in the inner div
        height: '100%',
        overflow: 'hidden' // Prevent the drawer body from scrolling
    }}
>
