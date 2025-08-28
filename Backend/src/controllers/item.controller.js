import Item from '../models/Item.js';

export async function createItem(req, res){
try{
    const item = await Item.create({...req.body, owner: req.user.id});
    res.json(item);
}
catch(e){
    res.status(500).json({error: 'Failed to create item'});
}
}

export async function getItems(req, res){
    try{
        const items = await Item.find({owner: req.user.id});
        res.json(items);
    }
    catch(e){
        res.status(500).json({error: 'Failed to get items'});
}
}