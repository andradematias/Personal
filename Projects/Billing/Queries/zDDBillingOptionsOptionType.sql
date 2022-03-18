SELECT
    [Option Type]
FROM
    [Billing Options Lookup]
WHERE
    Status = 'Active'
    AND [Start Date] <= GETDATE()
    AND [End Date] >= GETDATE()