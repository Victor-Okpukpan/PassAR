-- PASSAR - Decentralized Event Ticketing on @aoTheComputer
Events = Events or {}
UserBalances = UserBalances or {}
TOKEN_PROCESS_ID = "APgPW8AVfANq2dzTLjuEI_8VT4i67ms47S9e1kPyjec"

Handlers.add("AddNewEventT", Handlers.utils.hasMatchingTag("Action", "AddNewEventT"), function(msg)
    -- Input validation
    assert(type(msg.Tags.EventTitle) == "string", "Event Title is required")
    assert(type(msg.Tags.EventDescription) == "string", "Event Description is required")
    assert(type(msg.Tags.EventDate) == "string", "Event Date is required")
    assert(type(msg.Tags.Location) == "string", "Location is required")
    assert(type(msg.Tags.ImageUrl) == "string", "ImageUrl is required")

    -- Create new event object
    local newEvent = {
        id = #Events + 1,
        creator = msg.From,
        title = msg.Tags.EventTitle,
        description = msg.Tags.EventDescription,
        date = msg.Tags.EventDate,
        location = msg.Tags.Location,
        ticketPrice = msg.Tags.TicketPrice,
        image = msg.Tags.ImageUrl,
        timestamp = os.time(),
        noOfRegistrations = 0,
        registeredUsers = {},
        paidUsers = {},
        active = "true"
    }

    -- Add event to events table
    table.insert(Events, newEvent)

    msg.reply({
        Data = "Event created successfully.",
        event = newEvent
    })
end)

-- Get all events
Handlers.add("GetEvents", Handlers.utils.hasMatchingTag("Action", "GetEvents"), function(msg)
    msg.reply({
        Data = "Events retrieved successfully.",
        events = Events
    })
end)

-- Get all events
Handlers.add("GetEventCOunt", Handlers.utils.hasMatchingTag("Action", "GetEventCOunt"), function(msg)
    msg.reply({
        Data = "Events retrieved successfully.",
        eventCOunt = #Events
    })
end)

-- Get events created by user
Handlers.add("GetUserEvents", Handlers.utils.hasMatchingTag("Action", "GetUserEvents"), function(msg)
    local userEvents = {}
    for _, event in ipairs(Events) do
        if event.creator == msg.From then

            table.insert(userEvents, event)
        else

        end
    end

    msg.reply({
        Data = "User events retrieved.",
        events = userEvents
    })
end)

-- Get specific event by ID
Handlers.add("GetEvent", Handlers.utils.hasMatchingTag("Action", "GetEvent"), function(msg)
    assert(type(msg.Tags.EventId) == "string", "Event ID is required")
    local eventId = tonumber(msg.Tags.EventId)
    assert(eventId, "Invalid event ID")

    local event = Events[eventId]
    assert(event, "Event not found")

    msg.reply({
        Data = "Event retrieved.",
        event = event
    })
end)

-- Get specific event by ID
Handlers.add("ModifyEventStatus", Handlers.utils.hasMatchingTag("Action", "ModifyEventStatus"), function(msg)

    assert(type(msg.Tags.EventId) == "string", "Event ID is required")
    local eventId = tonumber(msg.Tags.EventId)
    assert(eventId, "Invalid event ID")

    local event = Events[eventId]
    assert(event, "Event not found")

    if event.creator == msg.From then
        assert(type(msg.Tags.EventStatus) == "string", "Event Status is required")
        assert((msg.Tags.EventStatus) == "true" or (msg.Tags.EventStatus) == "false",
            "Event Status is either true or false")

        -- event.active = msg.Tags.EventStatus
        Events[eventId].active = msg.Tags.EventStatus

    end

    msg.reply({
        Data = "Event retrieved.",
        event = event
    })
end)

Handlers.add("RegisterForEvent", Handlers.utils.hasMatchingTag("Action", "RegisterForEvent"), function(msg)
    assert(type(msg.Tags.EventId) == "string", "Event ID is required")
    local eventId = tonumber(msg.Tags.EventId)
    assert(eventId, "Invalid event ID")

    local event = Events[eventId]

    event.noOfRegistrations = event.noOfRegistrations + 1
    local registeredUsers = event.registeredUsers

    local isUserRegistered = false

    for i = 1, #registeredUsers do
        if registeredUsers[i] == msg.From then
            isUserRegistered = true
            return
        end
    end

    if isUserRegistered == false then
        table.insert(event.registeredUsers, #registeredUsers + 1, msg.From)
    end

    msg.reply({
        Data = "Registration Success",
        registeredUsers = event.registeredUsers
    })
end)

Handlers.add("GetEventRegistrationCount", Handlers.utils.hasMatchingTag("Action", "GetEventRegistrationCount"),
    function(msg)
        assert(type(msg.Tags.EventId) == "string", "Event ID is required")
        local eventId = tonumber(msg.Tags.EventId)
        assert(eventId, "Invalid event ID")

        local event = Events[eventId]

        msg.reply({
            Data = "Events retrieved successfully.",
            eventRegistrationCount = #event.registeredUsers
        })
    end)

Handlers.add("GetEventRegistrants", Handlers.utils.hasMatchingTag("Action", "GetEventRegistrants"), function(msg)
    assert(type(msg.Tags.EventId) == "string", "Event ID is required")
    local eventId = tonumber(msg.Tags.EventId)
    assert(eventId, "Invalid event ID")

    local event = Events[eventId]

    local registrants = {}

    for i = 1, #event.registeredUsers, 1 do
        registrants[i] = event.registeredUsers[i]
    end

    msg.reply({
        Data = "Events retrieved successfully.",
        registrants = registrants
    })
end)

Handlers.add("WithdrawBalance", Handlers.utils.hasMatchingTag("Action", "WithdrawBalance"), function(msg)
    local userBalance = UserBalances[msg.From]

    if userBalance == nil or userBalance == 0 then

        msg.reply({
            Data = "You have no balance"
        })
    else

        local userBalanceString = tostring(userBalance)

        ao.send({
            Target = TOKEN_PROCESS_ID,
            Action = "Transfer",
            Recipient = msg.From,
            Quantity = userBalanceString
        })

        UserBalances[msg.From] = 0

        msg.reply({
            Data = "You have withdrawn " .. userBalanceString .. " successfully"
        })
    end
end)

Handlers.add("Credit-Notice", Handlers.utils.hasMatchingTag("Action", "Credit-Notice"), function(msg)

    if msg.From ~= TOKEN_PROCESS_ID then

        ao.send({
            Target = msg.From,
            Action = "Transfer",
            Recipient = msg.Sender,
            Quantity = msg.Quantity
        })

    else

        local msgTags = msg.Tags
        assert(type(msgTags["X-EventId"]) == "string", "Event ID is required")
        local eventId = tonumber(msgTags["X-EventId"])
        assert(eventId, "Invalid event ID")

        local event = Events[eventId]
        local eventTicketPrice = math.floor(event.ticketPrice * math.pow(10, 12))
        local qty = tonumber(msg.Quantity)
        local tokenQuantity = qty * 1

        local paidUsers = event.paidUsers

        local userPaid = false

        for i = 1, #event.paidUsers do
            if paidUsers[i] == msg.Sender then
                userPaid = true
            end
        end

        if userPaid == false then
            if tokenQuantity ~= eventTicketPrice then
                ao.send({
                    Target = TOKEN_PROCESS_ID,
                    Action = "Transfer",
                    Recipient = msg.Sender,
                    Quantity = msg.Quantity
                })
            else
                table.insert(event.paidUsers, #event.paidUsers + 1, msg.Sender)

                if (UserBalances[event.creator] == nil) then
                    UserBalances[event.creator] = 0
                end

                UserBalances[event.creator] = tonumber(UserBalances[event.creator]) + tonumber(msg.Quantity)

                msg.reply({
                    Data = "Event Payment Success"
                })
            end
        else
            ao.send({
                Target = TOKEN_PROCESS_ID,
                Action = "Transfer",
                Recipient = msg.Sender,
                Quantity = msg.Quantity
            })
        end

    end

end)
