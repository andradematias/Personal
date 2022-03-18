SELECT
    [Subscription Pack Name],
    [Subcription Pack ID]
FROM
    [Subscription Pack]
WHERE
    Status = 'Active'
    AND [Start Date] <= GETDATE()
    AND [End Date] >= CAST(GETDATE() as date)