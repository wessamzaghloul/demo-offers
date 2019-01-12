/**
 * @module api:offer:offers-list
 */

const _             = require("lodash");
const price_tool    = require("../../services/price-tool");
const pg            = require("../../services/pg");

/**
 * Checks whether customer hours range can be fulfilled by a given partner hours range.
 *
 * @param   {String}    - Customer hours range formatted `HH-HH`
 * @param   {String}    - Partner hours range formatted `HH-HH`
 * @return  {Boolean}   - True if customer hours can be fulfilled
 */
const matches_hours_range = (customer_hours, partner_hours) => {
    if (!customer_hours) { return true; }
    if (!partner_hours) { return false; }
    const [c_start, c_end] = customer_hours.split("-").map(_.toNumber);
    const [p_start, p_end] = partner_hours.split("-").map(_.toNumber);
    return !!(c_start >= p_start && c_end <= p_end);
};

/**
 * Checks whether a customer schedule can be supplied by a given partner schedule.
 *
 * @param   {Object}    customer_schedule   - The customer schedule object
 * @param   {Object}    partner_schedule    - The partner schedule object
 * @return  {Boolean}                       - True if customer schedule can be fulfilled
 */
const matches_schedule = (customer_schedule, partner_schedule) => _
    .every(customer_schedule, (hours, day) => matches_hours_range(hours, partner_schedule[day]));

const handler_list_offers = async (request, response) => {
    try {
        const { partner_id } = request.params;
        console.log(`[api:offer:offers-list:handler_list_offers][info] - Getting list of offers - partner: ${partner_id} - request params: ${JSON.stringify(request.params)} - request query: ${JSON.stringify(request.query)}`);

        //-- Query PG to get list of new and accepted offers --
        const result = await pg.query(`
            SELECT      CASE WHEN cus.served_by IS NOT NULL
                            THEN 'accepted'
                            ELSE 'new'
                        END                     AS status,
                        par.public_id           AS partner_id,
                        cus.public_id           AS customer_id,
                        cus.name                AS customer_name,
                        cus.company_name        AS customer_company,
                        cus.address_street,
                        cus.address_city,
                        cus.address_postalcode,
                        cus.schedule,
                        TRUE                    AS schedule_matches,
                        con.price               AS contract_price,
                        con.name                AS contract_name,
                        con.start               AS contract_start,
                        cus.area_code           AS area_code,
                        par.working_schedule    AS partner_schedule
            FROM        app.customer    cus
            JOIN        app.partner     par     ON  par.public_id   = $1
            LEFT JOIN   app.contract    con     ON  con.customer    = cus.id
                                                AND con.served_by   = cus.served_by
            WHERE       cus.customer_type       = 'b2b'
            AND         par.status              = 'active'
            AND         cus.area_code           = par.area_code
            ORDER BY    con.start DESC
        `, [partner_id]);

        //-- Process list of offers --
        const offers = await Promise.all(result
            //-- Adding boolean attribute if customer schedule matches partners working schedule --
            .map(offer => ({
                ...offer,
                schedule_matches : matches_schedule(offer.schedule, offer.partner_schedule),
            }))
            //-- Adding price for new offers --
            .map(async offer => (offer.status === "accepted"
                ? {
                    ...offer,
                    contract_price : +offer.contract_price,
                }
                : {
                    ...offer,
                    contract_price : await price_tool.get_offer_price(offer),
                })));

        //-- Endpoint response --
        console.log(`[api:offer:offers-list:handler_list_offers][info] - Got list of offers - partner: ${partner_id} - #offers: ${_.size(offers)} - request params: ${JSON.stringify(request.params)} - request query: ${JSON.stringify(request.query)}`);
        return response.json({
            //-- Removing unnecessary attributes --
            offers: offers.map(offer => _.omit(offer, ["area_code", "partner_schedule"])),
        });
    } catch (error) {
        console.log(`[api:offer:offers-list:handler_list_offers][error] - Failed to get offers list - error: ${JSON.stringify(error)} - request params: ${JSON.stringify(request.params)} - request query: ${JSON.stringify(request.query)} - stack: ${(error || {}).stack}`);
        return response.status(500).json({ error: "server_error" });
    }
};

module.exports = api => api.route("/offer/:partner_id/").get(handler_list_offers);
