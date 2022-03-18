SELECT
    [Amount],
    [Unit Type],
    [Subscription Pack ID],
    [Billing Lookup ID]
FROM
    [Billing Options Lookup]
WHERE
    [Option Type] = @Value