/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "export",
    env: {
        CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS,
        CHAIN_ID: process.env.CHAIN_ID
      }
}

module.exports = nextConfig
