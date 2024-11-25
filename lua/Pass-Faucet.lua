TOKEN_PROCESS_ID = "APgPW8AVfANq2dzTLjuEI_8VT4i67ms47S9e1kPyjec"

TokensClaimed = TokensClaimed or {}

Handlers.add("ClaimToken", Handlers.utils.hasMatchingTag("Action", "ClaimToken"), function(msg)

    local amountToClaim = tostring(math.floor(50 * math.pow(10, 12)))

    if TokensClaimed[msg.From] == nil then
        TokensClaimed[msg.From] = amountToClaim

        ao.send({
            Target = TOKEN_PROCESS_ID,
            Action = "Transfer",
            Quantity = amountToClaim,
            Recipient = msg.From
        })

        msg.reply({
            Data = "Successfully claimed " .. amountToClaim .. " tokens."
        })
    else
        msg.reply({
            Data = "You have already claimed your tokens."
        })
    end
end)
