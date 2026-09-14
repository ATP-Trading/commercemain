export const ADDRESS_FIELDS = `id firstName lastName company address1 address2 city province country territoryCode zoneCode zip phoneNumber`
export const ORDERS_QUERY = `query AccountOrders($after: String) {
  customer { orders(first: 10, after: $after, sortKey: PROCESSED_AT, reverse: true) {
    nodes { id name processedAt financialStatus fulfillmentStatus cancelledAt statusPageUrl
      totalPrice { amount currencyCode }
      lineItems(first: 5) { nodes { title quantity } pageInfo { hasNextPage } }
    }
    pageInfo { hasNextPage endCursor }
  } }
}`
export const ADDRESSES_QUERY = `query AccountAddresses($after: String) {
  customer { defaultAddress { id } addresses(first: 20, after: $after) {
    nodes { ${ADDRESS_FIELDS} } pageInfo { hasNextPage endCursor }
  } }
}`
export const ADDRESS_CREATE = `mutation AddAddress($address: CustomerAddressInput!, $defaultAddress: Boolean) {
  customerAddressCreate(address: $address, defaultAddress: $defaultAddress) {
    customerAddress { ${ADDRESS_FIELDS} } userErrors { field message code }
  }
}`
export const ADDRESS_UPDATE = `mutation EditAddress($addressId: ID!, $address: CustomerAddressInput, $defaultAddress: Boolean) {
  customerAddressUpdate(addressId: $addressId, address: $address, defaultAddress: $defaultAddress) {
    customerAddress { ${ADDRESS_FIELDS} } userErrors { field message code }
  }
}`
