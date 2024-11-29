import {
    Table,
    TableHead,
    TableRow,
    TableHeader,
    TableBody,
    TableCell,
    DescriptionList,
    DescriptionListItem,
    Text,
    hubspot
} from '@hubspot/ui-extensions';

hubspot.extend(() => {
    return (
        <>
            <Description />
            <DepositTable />
        </>
    );
});

const DepositTable = () => {
    return (
        <Table bordered={true} paginated={false} pageCount={5}>
            <TableHead>
                <TableRow>
                    <TableHeader width="min">Deposit ID</TableHeader>
                    <TableHeader width="min">Amount</TableHeader>
                    <TableHeader width="min">Date</TableHeader>
                </TableRow>
            </TableHead>
            <TableBody>
                <TableRow>
                    <TableCell width="min">Initial Payment</TableCell>
                    <TableCell width="min">$1,000.00</TableCell>
                    <TableCell width="min">29 Dec 2024 1:00 PM GMT+8</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell width="min">2nd Payment</TableCell>
                    <TableCell width="min">$1,000.00</TableCell>
                    <TableCell width="min">23 Feb 2025 1:00 PM GMT+8</TableCell>
                </TableRow>
            </TableBody>
        </Table>
    );
};

const Description = () => {
    return (
        <>
        <DescriptionList direction="row">
            <DescriptionListItem label="Total Paid">
                <Text>$2,000.00</Text>
            </DescriptionListItem>
            <DescriptionListItem label="Unpaid Amount">
                <Text>$2,000.00</Text>
            </DescriptionListItem>
        </DescriptionList>
        <DescriptionList direction="row">
            <DescriptionListItem label="Total Paid">
                <Text>$2,000.00</Text>
            </DescriptionListItem>
            <DescriptionListItem label="Unpaid Amount">
                <Text>$2,000.00</Text>
            </DescriptionListItem>
        </DescriptionList>
        </>
    );
};
