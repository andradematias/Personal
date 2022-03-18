SELECT
    [Display Value],
    [Options Value]
FROM
    [zdropdownlookup]
WHERE
    [List Name] = 'zDDBillingOptionsStatus'
    and [Status] = 'Enabled'
ORDER BY
    [Display Value]