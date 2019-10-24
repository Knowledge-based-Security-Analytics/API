import { Service } from "typedi";
import { catCepRestPost, catCepRestDelete, catCepRestPut } from "../log/config.logging";
import { StatementApiReturn } from "../../models/api/statementApiReturn.type";
import { CustomException } from "../../models/exception/custom.exception";
const axios = require('axios').default;

@Service()
export class StatementsRestApiService {
    public async postStatement( eplStatement: string, deploymentId?: string): Promise<StatementApiReturn> {
        try {
            const response = (deploymentId) ? await axios.put(`http://localhost:8080/statement/${deploymentId}`, { statement: eplStatement }) : await axios.post(`http://localhost:8080/statement/`, { statement: eplStatement });
            catCepRestPost.info(() => `Statement successfully redeployed under DeploymentID ${ response.data.deploymentId }` );
            return {deploymentId: response.data.deploymentId, deploymentIdDependencies: response.data.deploymentIdDependencies};
        } catch(error) {
            catCepRestPut.info(() => `${ error }` );
            throw new CustomException(error.response.data.error);
        }
    }

    public async deleteStatement(deploymentId?: string): Promise<void> {
        const endpoint = (deploymentId) ? `http://localhost:8080/statement/${deploymentId}` : `http://localhost:8080/statement/all`;
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