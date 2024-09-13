import { LinkContainer } from 'react-router-bootstrap';
import { Table, Button, Row, Col } from 'react-bootstrap';
import { FaEdit, FaTrash } from 'react-icons/fa';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import { useGetActivitiesQuery, useCreateActivityMutation, useDeleteActivityMutation } from '../../slices/activitiesSlice.js';
import { toast } from 'react-toastify';
const ActivitiesListScreen = () => {
    const { data: activities, isLoading, error, refetch } = useGetActivitiesQuery();
    const [createActivity, { isLoading: loadingCreate }] = useCreateActivityMutation();
    const [deleteActivity, { isLoading: loadingDelete }] = useDeleteActivityMutation();
    
    const deleteHandler = async (id) => {
        if (window.confirm('Are you sure?')) {
            try {
                await deleteActivity(id);
                toast.success('Activity deleted');
                refetch();
            } catch (err) {
                toast.error(err?.data?.Message || (typeof err.error === 'object' ? JSON.stringify(err.error) : err.error));
            }
        }
    };

    const createActivityHandler = async () => {
        if (window.confirm('Are you sure you want to create a new activity?')) {
            try {
                await createActivity();
                refetch();
            } catch (err) {
                toast.error(err?.data?.Message || (typeof err.error === 'object' ? JSON.stringify(err.error) : err.error));
            }
        }
    };

    return (
        <>
            <Row className='align-items-center'>
                <Col>
                    <h1>Activities</h1>
                </Col>
                <Col className='text-end'>
                    <Button className='btn-sm m-3' onClick={createActivityHandler}>
                        <FaEdit /> Create Activity
                    </Button>
                </Col>
            </Row>

            {loadingCreate && <Loader />}
            {loadingDelete && <Loader />}
            {isLoading ? (
                <Loader />
            ) : error ? (
                <Message variant='danger'>{error.message || 'An error occurred'}</Message>
            ) : (
                <>
                    <Table striped hover responsive className='table-sm'>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>NAME</th>
                                <th>DIFFICULTY LEVEL</th>
                                <th>TYPE</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activities.map((activity) => (
                                <tr key={activity._id}>
                                    <td>{activity._id}</td>
                                    <td>{activity.name}</td>
                                    <td>{activity.difficultyLevel}</td>
                                    <td>{activity.type || 'N/A'}</td>
                                    <td>
                                        <LinkContainer to={`/admin/activities/${activity._id}/edit`}>
                                            <Button variant='light' className='btn-sm mx-2'>
                                                <FaEdit />
                                            </Button>
                                        </LinkContainer>
                                        <Button variant='danger' className='btn-sm' onClick={() => deleteHandler(activity._id)}>
                                            <FaTrash style={{ color: 'white' }} />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </>
            )}
        </>
    );
}

export default ActivitiesListScreen