// import del from "del"
import {deleteAsync} from 'del';

export const reset = async () => {
    return await deleteAsync(app.path.clean)
}