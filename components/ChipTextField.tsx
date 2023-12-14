import React from "react";
import { Autocomplete, Chip, TextField } from "@mui/material";

interface ChipTextFieldProps {
    onChipsChange: (tags: string[]) => void;
}

const ChipTextField = (props: ChipTextFieldProps) => {
    return (
        <Autocomplete
            sx={{ maxWidth: '365px', marginTop: "4px" }}
            clearIcon={false}
            options={[]}
            freeSolo
            multiple
            renderTags={(value, getTagProps) => (
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {value.map((option, index) => {
                        const tagProps = getTagProps({ index });
                        const { key, ...otherProps } = tagProps;
                        return (
                            <Chip key={key} label={option} {...otherProps} style={{ margin: '2px' }} />
                        );
                    })}
                </div>
            )}
            renderInput={(val) => <TextField sx={{
                '& label': {
                    color: '#374151',
                    fontSize: '16px',
                    padding: "1px",
                },
            }} {...val} />}
            onChange={(_, value) => props.onChipsChange(value)}
        />
    );
};

export default ChipTextField;