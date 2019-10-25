import { Service } from "typedi";
import { catCepRestPost, catCepRestDelete, catCepRestPut } from "../log/config.logging";
import { StatementApiReturn } from "../../models/api/statementApiReturn.type";
import { CustomException } from "../../models/exception/custom.exception";
const axios = require('axios').default;

@Service()
export class StatementsRestApiService {

    public async postStatement( eplStatement: string, deploymentId?: string): Promise<StatementApiReturn> {
        const { ESPER_HOST } = process.env;
        try {
            console.log(ESPER_HOST);
            const response = (deploymentId) ? await axios.put(`${ ESPER_HOST }/statement/${ deploymentId }`, { statement: eplStatement }) : await axios.post(`${ ESPER_HOST }/statement/`, { statement: eplStatement });
            catCepRestPost.info(() => `Statement successfully redeployed under DeploymentID ${ response.data.deploymentId }` );
            return {deploymentId: response.data.deploymentId, deploymentIdDependencies: response.data.deploymentIdDependencies};
        } catch(error) {
            (deploymentId) ? catCepRestPut.info(() => `${ error }` ) :  catCepRestPost.info(() => `${ error }` );
            throw new CustomException(error.response.data.error);
        }
    }

    public async deleteStatement(deploymentId?: string): Promise<void> {
        const { ESPER_HOST } = process.env;
        const endpoint = (deploymentId) ? `${ ESPER_HOST }/statement/${deploymentId}` : `${ ESPER_HOST }/statement/all`;
        const responseString = (deploymentId) ? `Statement ${ deploymentId } successfully undeployed` : `All statements successfully undeployed`
        try {
           await axios.delete(endpoint);
            catCepRestPost.info(() => `${ responseString }` );
        } catch(error) {
            catCepRestDelete.info(() => `${ error }` );
            throw new CustomException(error.response.data);
        }
    }
}